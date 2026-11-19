# HEMANX

**Human Emotion Monitoring and Analysis System**

An AI-powered multimodal emotion analysis web application supporting:

- Face Emotion Recognition
- Text Emotion Recognition
- Voice Emotion Recognition
- Multimodal Emotion Recognition (Face + Voice + Text)

> **Disclaimer:** All emotion outputs are AI-estimated predictions for research and demonstration purposes. They are **not** medical diagnoses and must not be used to assess a person's psychological state.

## Status

Project under active development. See `docs/` for architecture, database schema, API documentation, training notes, and deployment guides.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python Flask |
| Database | MongoDB Atlas (M0 Free) |
| ML | PyTorch, Transformers, OpenCV, Librosa |
| Hosting | Vercel (frontend), Render (backend), Hugging Face Spaces (inference) |

## Repository Layout

``` 
frontend/    React application
backend/     Flask API
ml/          Inference code (face, text, voice, multimodal)
training/    Training scripts and Colab notebooks
evaluation/  Model evaluation reports
tests/       Backend tests
docs/        Project documentation
deployment/  Deployment configuration
```

## License

Personal research / portfolio project. Not for commercial use.
