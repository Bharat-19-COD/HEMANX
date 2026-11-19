from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from dotenv import load_dotenv
import datetime
import pytz
import re

load_dotenv()

app = Flask(__name__)
# Explicitly allow frontend origin
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret')
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret')
jwt = JWTManager(app)

# MongoDB Connection
mongo_uri = os.getenv('MONGODB_URI')
client = MongoClient(mongo_uri)
db = client.get_database("hemanx")
users_collection = db.get_collection("users")

# Timezones
IST = pytz.timezone('Asia/Kolkata')
def get_current_time():
    # Returns current time as timezone-aware IST
    return datetime.datetime.now(IST)

# --- ROUTES ---

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return {"status": "ok", "database": "connected", "message": "HEMANX Backend is running!"}, 200
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}, 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    mobile = data.get('mobile')
    role = data.get('role')
    password = data.get('password')
    
    # NAYA: Age aur Gender add kiya gaya hai report ke liye
    age = data.get('age', 'Not specified')
    gender = data.get('gender', 'Not specified')

    if not first_name or not last_name or not email or not mobile or not role or not password:
        return jsonify({"error": "All fields are required"}), 400

    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format."}), 400

    mobile_regex = r'^[6-9]\d{9}$'
    if not re.match(mobile_regex, mobile):
        return jsonify({"error": "Invalid mobile number. Must be 10 digits."}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = {
        "firstName": first_name,
        "lastName": last_name,
        "name": f"{first_name} {last_name}",
        "email": email,
        "mobile": mobile,
        "role": role,
        "password": hashed_password,
        "age": age,
        "gender": gender
    }
    users_collection.insert_one(new_user)

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "name": user['name'], 
            "firstName": user.get('firstName', ''),
            "email": user['email'],
            "role": user.get('role', 'User'),
            "age": user.get('age', 'Not specified'),
            "gender": user.get('gender', 'Not specified')
        }
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_email = get_jwt_identity()
    user = users_collection.find_one({"email": current_user_email}, {"_id": 0, "password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200

@app.route('/api/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_email = get_jwt_identity()
        data = request.get_json()
        
        # Jo fields aayi hain unko update karo
        update_data = {}
        if 'firstName' in data: update_data['firstName'] = data['firstName']
        if 'lastName' in data: update_data['lastName'] = data['lastName']
        if 'firstName' in data and 'lastName' in data:
            update_data['name'] = f"{data['firstName']} {data['lastName']}"
        if 'mobile' in data: update_data['mobile'] = data['mobile']
        if 'age' in data: update_data['age'] = data['age']
        if 'gender' in data: update_data['gender'] = data['gender']

        if not update_data:
            return jsonify({"error": "No data provided to update"}), 400

        users_collection.update_one({"email": current_user_email}, {"$set": update_data})
        
        # Updated user data fetch karo (password chhod kar)
        updated_user = users_collection.find_one({"email": current_user_email}, {"_id": 0, "password": 0})
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500    


# --- TEXT EMOTION ANALYSIS ---
from transformers import pipeline

print("Loading Text Emotion Model...")
text_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)
print("Text Emotion Model Loaded!")

@app.route('/api/text/analyze', methods=['POST'])
@jwt_required()
def analyze_text():
    data = request.get_json()
    text = data.get('text')

    if not text or len(text.strip()) == 0:
        return jsonify({"error": "Text is required for analysis"}), 400

    try:
        results = text_classifier(text)[0]
        best_match = max(results, key=lambda x: x['score'])
        formatted_results = {item['label']: round(item['score'] * 100, 2) for item in results}

        db.get_collection("analyses").insert_one({
            "user_email": get_jwt_identity(),
            "type": "text",
            "emotion": best_match['label'],
            "confidence": round(best_match['score'] * 100, 2),
            "text_input": text,
            "timestamp": get_current_time()
        })

        return jsonify({
            "text": text,
            "dominant_emotion": best_match['label'],
            "confidence": round(best_match['score'] * 100, 2),
            "all_probabilities": formatted_results
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- FACE EMOTION ANALYSIS ---
from PIL import Image
import io
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification

print("Loading Face Emotion Model...")
face_processor = AutoImageProcessor.from_pretrained("trpakov/vit-face-expression")
face_model = AutoModelForImageClassification.from_pretrained("trpakov/vit-face-expression")
print("Face Emotion Model Loaded!")

@app.route('/api/face/analyze', methods=['POST'])
@jwt_required()
def analyze_face():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        inputs = face_processor(images=img, return_tensors="pt")
        
        with torch.no_grad():
            outputs = face_model(**inputs)
            
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = face_model.config.id2label[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item() * 100

        all_probs = {}
        for idx, prob in enumerate(probabilities[0]):
            label = face_model.config.id2label[idx]
            all_probs[label] = round(prob.item() * 100, 2)

        db.get_collection("analyses").insert_one({
            "user_email": get_jwt_identity(),
            "type": "face",
            "emotion": predicted_label,
            "confidence": round(confidence, 2),
            "timestamp": get_current_time()
        })

        return jsonify({
            "dominant_emotion": predicted_label,
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- VOICE EMOTION ANALYSIS ---
import torchaudio
import tempfile
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

print("Loading Voice Emotion Model...")
voice_processor = AutoFeatureExtractor.from_pretrained("superb/wav2vec2-base-superb-er")
voice_model = AutoModelForAudioClassification.from_pretrained("superb/wav2vec2-base-superb-er")
print("Voice Emotion Model Loaded!")

@app.route('/api/voice/analyze', methods=['POST'])
@jwt_required()
def analyze_voice():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    temp_audio_path = None
    try:
        # NAYA: Pydub import karo
        from pydub import AudioSegment
        import io

        # File ko read karo
        audio_bytes = file.read()
        
        # Pydub se audio load karo (Ye webm, wav, mp3 sab padh leta hai)
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
        
        # Audio ko WAV format me convert karo
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_audio_path = temp_audio.name
        temp_audio.close()
        
        # Converted audio ko save karo
        audio.export(temp_audio_path, format="wav")

        # Ab torchaudio se load karo (jo ab sahi wav format me hai)
        waveform, sample_rate = torchaudio.load(temp_audio_path)
        
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)

        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        inputs = voice_processor(waveform.squeeze().numpy(), sampling_rate=16000, return_tensors="pt")
        
        with torch.no_grad():
            outputs = voice_model(**inputs)
            
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = voice_model.config.id2label[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item() * 100

        all_probs = {}
        for idx, prob in enumerate(probabilities[0]):
            label = voice_model.config.id2label[idx]
            all_probs[label] = round(prob.item() * 100, 2)

        db.get_collection("analyses").insert_one({
            "user_email": get_jwt_identity(),
            "type": "voice",
            "emotion": predicted_label,
            "confidence": round(confidence, 2),
            "timestamp": get_current_time()
        })

        return jsonify({
            "dominant_emotion": predicted_label,
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


# --- HISTORY ROUTE ---
@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        user_email = get_jwt_identity()
        history = list(db.get_collection("analyses").find(
            {"user_email": user_email}, 
            {"_id": 0}
        ).sort("timestamp", -1).limit(10))
        
        for item in history:
            if "timestamp" in item:
                item["timestamp"] = item["timestamp"].isoformat()
                
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- GRAPH DATA ROUTE (UPDATED FOR TIMEZONE FIX) ---
@app.route('/api/history/graph', methods=['GET'])
@jwt_required()
def get_graph_data():
    try:
        user_email = get_jwt_identity()
        timeframe = request.args.get('timeframe', 'today')
        
        # 1. Get current time in UTC because MongoDB saves everything in UTC
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        query = {"user_email": user_email}
        
        # 2. Filter logic based on UTC
        if timeframe == 'today':
            start_time = now_utc - datetime.timedelta(hours=24)
            query["timestamp"] = {"$gte": start_time}
        elif timeframe == 'week':
            start_time = now_utc - datetime.timedelta(days=7)
            query["timestamp"] = {"$gte": start_time}
        elif timeframe == 'month':
            start_time = now_utc - datetime.timedelta(days=30)
            query["timestamp"] = {"$gte": start_time}
        
        history = list(db.get_collection("analyses").find(
            query, 
            {"_id": 0, "timestamp": 1, "emotion": 1, "confidence": 1}
        ).sort("timestamp", 1))
        
        graph_data = []
        for item in history:
            emotion = item.get('emotion', 'neutral').lower()
            score = 50
            
            if emotion in ['happy', 'joy', 'surprise']: score = 80 + (item.get('confidence', 0) * 0.2)
            elif emotion in ['sad', 'fear', 'disgust', 'angry']: score = 20 + (item.get('confidence', 0) * 0.2)
            else: score = 50 + (item.get('confidence', 0) * 0.2)

            # 3. Convert UTC from DB to IST for the X-Axis display
            utc_time = item['timestamp'].replace(tzinfo=datetime.timezone.utc)
            ist_time = utc_time.astimezone(IST)

            if timeframe == 'today':
                time_str = ist_time.strftime("%H:%M")
            else:
                time_str = ist_time.strftime("%d %b %H:%M")
                
            graph_data.append({
                "time": time_str,
                "score": round(min(100, max(0, score)), 2),
                "emotion": emotion.capitalize()
            })
            
        return jsonify(graph_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- INSIGHTS ROUTE ---
@app.route('/api/insights', methods=['GET'])
@jwt_required()
def get_insights():
    try:
        user_email = get_jwt_identity()
        # Get latest scan
        latest = db.get_collection("analyses").find_one(
            {"user_email": user_email}, 
            sort=[("timestamp", -1)]
        )
        
        if not latest:
            return jsonify({
                "current_emotion": "None",
                "recommendation": "Start your first analysis to get personalized insights!"
            }), 200
            
        emotion = latest['emotion'].lower()
        
        insights = {
            "joy": "Excellent! Your mood is great. Channel this positive energy into something productive today.",
            "happy": "You're doing great! Keep smiling and share this positivity with someone.",
            "sad": "It's okay to feel sad. Try talking to a friend or doing a 5-minute breathing exercise.",
            "angry": "Your stress is a bit high. Try stepping away for a moment, drink some water, and relax.",
            "fear": "It looks like you're anxious. Try the 4-7-8 breathing technique to calm your mind.",
            "neutral": "You seem balanced today. A good time to focus on deep work or planning.",
            "surprise": "Something caught you off guard! Take a moment to process it."
        }
        
        recommendation = insights.get(emotion, "Keep tracking your mood to understand yourself better!")
        
        return jsonify({
            "current_emotion": latest['emotion'],
            "recommendation": recommendation
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- RECOMMENDATIONS ROUTE ---
# --- RECOMMENDATIONS ROUTE ---
@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        user_email = get_jwt_identity()
        
        # Latest scan nikalo
        latest = db.get_collection("analyses").find_one(
            {"user_email": user_email}, 
            sort=[("timestamp", -1)]
        )
        
        if not latest:
            return jsonify({
                "emotion": "Neutral",
                "is_high_stress": False,
                "message": "Please complete an analysis to get personalized recommendations."
            }), 200
            
        emotion = latest['emotion'].lower()
        confidence = latest['confidence']
        is_high_stress = emotion in ['sad', 'angry', 'fear', 'disgust'] and confidence > 60
        
        # Time Check karo (Morning ya Evening)
        current_hour = datetime.datetime.now(IST).hour
        is_morning = current_hour < 16 # 4 PM se pehle morning maan lenge
        
        # Base Recommendations
        recs = {
            "diet": {
                "title": "Sattvic Diet (Balanced)",
                "details": "Eat fresh, light, and easily digestible Sattvic food to maintain mental clarity.",
                "meals": {
                    "Morning": "Warm water with lemon + Soaked almonds & walnuts",
                    "Afternoon": "Brown rice / Roti + Moong Dal + Green Veggies",
                    "Evening": "Herbal tea (Tulsi/Ginger) + Roasted Makhana",
                    "Night": "Vegetable Khichdi with a spoon of A2 Ghee"
                },
                "video": "https://www.youtube.com/results?search_query=sattvic+diet+recipes+indian",
                "blog": "https://www.artofliving.org/in-en/ayurveda/sattvic-diet"
            },
            "exercise": {
                "title": "Light Cardio & Mobility",
                "details": "Keep your body active without exhausting it.",
                "time_30m": "15 min brisk walk + 15 min light stretching",
                "video": "https://www.youtube.com/results?search_query=30+minute+indian+home+workout",
                "blog": "https://www.artofliving.org/in-en/yoga/benefits-of-yoga"
            },
            "yoga": {},
            "music": {},
            "message": "You seem balanced. Maintain your Sattvic routine."
        }

        # Time-based Yoga aur Music set karo
        if is_morning:
            recs["yoga"] = {
                "title": "Morning Energizing Yoga",
                "details": "Wake up your body and mind with these dynamic practices.",
                "asana": "Surya Namaskar (12 rounds)",
                "pranayama": "Kapalbhati & Anulom Vilom",
                "video": "https://www.youtube.com/results?search_query=morning+surya+namaskar+and+pranayama",
                "blog": "https://www.artofliving.org/in-en/yoga/surya-namaskar"
            }
            recs["music"] = {
                "title": "Morning Ragas & Flute",
                "details": "Start your day with calming Indian classical music.",
                "recommendation": "Raga Bhairavi (Morning) & Indian Bamboo Flute",
                "video": "https://www.youtube.com/results?search_query=raga+bhairavi+morning+flute",
                "blog": "https://www.artofliving.org/in-en/meditation/music-for-meditation"
            }
        else:
            recs["yoga"] = {
                "title": "Evening Relaxing Yoga",
                "details": "Wind down your nervous system after a long day.",
                "asana": "Sukhasana, Paschimottanasana, Shavasana",
                "pranayama": "Bhramari & Sheetali",
                "video": "https://www.youtube.com/results?search_query=evening+relaxing+yoga+and+bhramari",
                "blog": "https://www.artofliving.org/in-en/yoga/bhramari-pranayama"
            }
            recs["music"] = {
                "title": "Evening OM & Nadyog Meditation",
                "details": "Deep relaxation with Himalayan sounds and OM chanting.",
                "recommendation": "OM Meditation, Nadyog & Himalayan Flute Music",
                "video": "https://www.youtube.com/@PragyaGeet",
                "blog": "https://www.artofliving.org/in-en/meditation/om-meditation"
            }
        
        # Emotion specific overrides
        if emotion in ['sad', 'fear']:
            recs["diet"]["title"] = "Warm & Mood-Boosting Sattvic Food"
            recs["diet"]["details"] = "Include warm Khichdi, vegetable soups, and Omega-3 rich seeds."
            recs["yoga"]["asana"] = "Sukhasana & Viparita Karani (Legs up the wall)"
            recs["yoga"]["pranayama"] = "Bhramari (Humming Bee) & Ujjayi"
            recs["music"]["recommendation"] = "Uplifting Bhajans on Pragya Geet & Raga Bhairavi"
            recs["message"] = "It's okay to feel sad. Sattvic food and OM chanting will help calm your mind."
            
        elif emotion in ['angry', 'disgust']:
            recs["diet"]["title"] = "Cooling Sattvic Diet"
            recs["diet"]["details"] = "Avoid spicy food. Drink coconut water, eat rice, and add coriander/cumin."
            recs["yoga"]["asana"] = "Shavasana & Balasana (Child's Pose)"
            recs["yoga"]["pranayama"] = "Sheetali (Cooling Breath) & Chandra Bhedana"
            recs["music"]["recommendation"] = "Nadyog Meditation & Himalayan Flute Music"
            recs["message"] = "You might be feeling irritated. Try Sheetali pranayama and listen to calming Himalayan music."
            
        elif emotion in ['happy', 'joy', 'surprise']:
            recs["diet"]["title"] = "High Energy Sattvic Diet"
            recs["diet"]["details"] = "Fresh fruits, sprouts, paneer, and plenty of water."
            recs["yoga"]["asana"] = "Vrikshasana & Trikonasana"
            recs["yoga"]["pranayama"] = "Surya Bhedana (Right Nostril Breathing)"
            recs["music"]["recommendation"] = "Uplifting Devotional Songs & Morning Flute"
            recs["message"] = "Excellent! Keep up the good energy with a fresh Sattvic diet."

        return jsonify({
            "emotion": latest['emotion'],
            "confidence": confidence,
            "is_high_stress": is_high_stress,
            "time_of_day": "Morning" if is_morning else "Evening",
            "recommendations": recs
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
# --- REPORT DATA ROUTE (NAYA) ---
@app.route('/api/report/data', methods=['GET'])
@jwt_required()
def get_report_data():
    try:
        user_email = get_jwt_identity()
        timeframe = request.args.get('timeframe', 'today')
        
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        query = {"user_email": user_email}
        
        if timeframe == 'today':
            query["timestamp"] = {"$gte": now_utc - datetime.timedelta(hours=24)}
        elif timeframe == 'week':
            query["timestamp"] = {"$gte": now_utc - datetime.timedelta(days=7)}
        elif timeframe == 'month':
            query["timestamp"] = {"$gte": now_utc - datetime.timedelta(days=30)}
        
        # Saara data nikalo
        history = list(db.get_collection("analyses").find(query).sort("timestamp", -1))
        
        # User ki details nikaalo
        user = users_collection.find_one({"email": user_email}) or {}
        
        modalities = {"facial": {}, "text": {}, "voice": {}, "multimodal": {}}
        max_stress = 0
        
        for item in history:
            mod = item.get('type', 'unknown')
            emo = item.get('emotion', 'neutral').capitalize()
            conf = item.get('confidence', 0)
            
            if mod in modalities:
                if emo not in modalities[mod]:
                    modalities[mod][emo] = []
                modalities[mod][emo].append(round(conf, 1))
            
            if emo.lower() in ['sad', 'angry', 'fear', 'disgust']:
                max_stress = max(max_stress, conf)
        
        formatted_mods = {}
        for mod, emotions in modalities.items():
            if not emotions: continue
            total_scans = sum(len(v) for v in emotions.values())
            avg_emotions = {}
            for emo, confs in emotions.items():
                percentage = (len(confs) / total_scans) * 100
                avg_emotions[emo] = round(percentage, 1)
            
            sorted_emos = sorted(avg_emotions.items(), key=lambda x: x[1], reverse=True)
            formatted_mods[mod] = sorted_emos

        return jsonify({
            "user": {
                "name": user.get('name', 'User'),
                "email": user_email,
                "gender": user.get('gender', 'Not specified'), # Handled safely
                "age": user.get('age', 'Not specified') # Handled safely
            },
            "timeframe": timeframe,
            "total_scans": len(history),
            "modalities": formatted_mods,
            "high_stress_alert": max_stress > 70
        }), 200
    except Exception as e:
        print("REPORT ERROR:", e) # Terminal me error dikhega
        return jsonify({"error": str(e)}), 500


# --- MULTIMODAL FUSION ROUTE ---
@app.route('/api/multimodal/analyze', methods=['POST'])
@jwt_required()
def analyze_multimodal():
    text = request.form.get('text', None)
    text_probs = {}
    
    if text and len(text.strip()) > 0:
        try:
            results = text_classifier(text)[0]
            text_probs = {item['label'].lower(): item['score'] for item in results}
        except Exception as e:
            print("Text error:", e)

    face_probs = {}
    if 'image' in request.files and request.files['image'].filename != '':
        file = request.files['image']
        try:
            img = Image.open(io.BytesIO(file.read())).convert('RGB')
            inputs = face_processor(images=img, return_tensors="pt")
            with torch.no_grad():
                outputs = face_model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            for idx, prob in enumerate(probabilities[0]):
                label = face_model.config.id2label[idx].lower()
                face_probs[label] = prob.item()
        except Exception as e:
            print("Face error:", e)

    voice_probs = {}
    if 'audio' in request.files and request.files['audio'].filename != '':
        file = request.files['audio']
        temp_audio_path = None
        try:
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            temp_audio_path = temp_audio.name
            file.save(temp_audio_path)
            temp_audio.close()
            
            waveform, sample_rate = torchaudio.load(temp_audio_path)
            if sample_rate != 16000:
                resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
                waveform = resampler(waveform)
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)

            inputs = voice_processor(waveform.squeeze().numpy(), sampling_rate=16000, return_tensors="pt")
            with torch.no_grad():
                outputs = voice_model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            for idx, prob in enumerate(probabilities[0]):
                label = voice_model.config.id2label[idx].lower()
                voice_probs[label] = prob.item()
        except Exception as e:
            print("Voice error:", e)
        finally:
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

    unified_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
    fused_probs = {label: 0.0 for label in unified_labels}
    
    weight_text = 0.33
    weight_face = 0.33
    weight_voice = 0.34
    
    active_modalities = 0
    if text_probs: active_modalities += 1
    if face_probs: active_modalities += 1
    if voice_probs: active_modalities += 1

    if active_modalities == 0:
        return jsonify({"error": "Please provide at least one input (text, image, or audio)."}), 400

    if active_modalities == 1:
        weight_text = 1.0 if text_probs else 0
        weight_face = 1.0 if face_probs else 0
        weight_voice = 1.0 if voice_probs else 0
    elif active_modalities == 2:
        weight_text = 0.5 if text_probs else 0
        weight_face = 0.5 if face_probs else 0
        weight_voice = 0.5 if voice_probs else 0

    for label in unified_labels:
        if label in text_probs: fused_probs[label] += text_probs[label] * weight_text
        if label == 'happy' and 'joy' in text_probs: fused_probs[label] += text_probs['joy'] * weight_text
        
        if label in face_probs: fused_probs[label] += face_probs[label] * weight_face
        if label == 'happy' and 'happiness' in face_probs: fused_probs[label] += face_probs['happiness'] * weight_face
        
        if label in voice_probs: fused_probs[label] += voice_probs[label] * weight_voice
        if label == 'happy' and 'hap' in voice_probs: fused_probs[label] += voice_probs['hap'] * weight_voice

    best_emotion = max(fused_probs, key=fused_probs.get)
    best_confidence = fused_probs[best_emotion] * 100

    all_probs_formatted = {k: round(v * 100, 2) for k, v in fused_probs.items()}

    db.get_collection("analyses").insert_one({
        "user_email": get_jwt_identity(),
        "type": "multimodal",
        "emotion": best_emotion,
        "confidence": round(best_confidence, 2),
        "text_input": text,
        "timestamp": get_current_time()
    })

    return jsonify({
        "dominant_emotion": best_emotion,
        "confidence": round(best_confidence, 2),
        "all_probabilities": all_probs_formatted,
        "modalities_used": active_modalities
    }), 200        


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)