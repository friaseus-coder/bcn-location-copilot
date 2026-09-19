FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias mínimas del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Puerto oficial de Hugging Face Spaces
EXPOSE 7860

# Comando de arranque del servidor FastAPI
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
