# Troubleshooting & Common Issues

This document covers common problems and solutions when working with the Personal AI Assistant.

## Python Environment Issues

### "No module named 'fastapi'" or similar import errors

**Problem:** Python can't find installed packages

**Solution:**

```bash
# Verify venv is activated (should see (venv) in prompt)
source backend/venv/bin/activate

# Reinstall requirements
pip install -r backend/requirements.txt

# Verify
python -c "import fastapi; print(f'OK: {fastapi.__version__}')"
```

**Prevention:** Always activate venv before running backend

---

### "python3: command not found"

**Problem:** Python 3 is not installed

**Solution:**

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-pip

# macOS
brew install python3

# Verify
python3 --version  # Should be 3.8+
```

---

### Virtual environment not working?

**Solution:**

```bash
# Completely recreate venv
rm -rf backend/venv
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

---

## Ollama Issues

### "Cannot connect to Ollama"

**Problem:** Ollama server is not running

**Solution:**

```bash
# Check if running
curl -s http://localhost:11434/api/tags

# If error, start Ollama in new terminal
ollama serve

# Should output: "Listening on 127.0.0.1:11434"
```

---

### "Ollama: command not found"

**Problem:** Ollama not installed

**Solution:**

```bash
bash scripts/install-ollama.sh

# Or manually
curl -fsSL https://ollama.ai/install.sh | sh

# Verify
ollama --version
```

---

### Model download stuck or slow

**Problem:** `ollama pull` is taking too long or hanging

**Solution:**

```bash
# Cancel (Ctrl+C) and try again
ollama pull mistral:3b-instruct-q4_K_M

# Check Ollama logs
# If stuck, delete and retry
ollama rm mistral:3b-instruct-q4_K_M
ollama pull mistral:3b-instruct-q4_K_M

# Alternative: Pull different model while waiting
ollama pull orca-mini:3b  # Smaller alternative
```

**Prevention:**

- Use quantized 4-bit models (`-q4_K_M`)
- Check internet connection
- Ensure 10+ GB free storage

---

### "Model not found" when running

**Problem:** Model specified in `.env` doesn't exist locally

**Solution:**

```bash
# List available models
ollama list

# Download the model
ollama pull mistral:3b-instruct-q4_K_M

# Verify correct name in .env
# Should match exactly: mistral:3b-instruct-q4_K_M
cat backend/.env | grep OLLAMA_MODEL
```

---

## API & Backend Issues

### "Port 8000 already in use"

**Problem:** Another process is using the port

**Solution:**

```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or run on different port
# Edit backend/config.py, change API_PORT to 3001
python -m uvicorn main:app --port 3001
```

---

### "Connection refused" when testing API

**Problem:** Backend is not running

**Solution:**

```bash
# Check if running
curl http://localhost:8000/health

# If refused, start backend
cd backend
source venv/bin/activate
python main.py

# Should output:
# Uvicorn running on http://127.0.0.1:8000
```

---

### API returns "Internal Server Error"

**Problem:** Backend crashed or encountered an error

**Solution:**

1. Check terminal where backend is running for error messages
2. Check `.env` configuration:

   ```bash
   cat backend/.env
   # Verify OLLAMA_BASE_URL and OLLAMA_MODEL
   ```

3. Verify Ollama is running: `curl http://localhost:11434/api/tags`
4. Restart backend:

   ```bash
   # Kill any processes on port 8000
   lsof -ti:8000 | xargs kill -9
   # Restart
   python main.py
   ```

---

### "Timeout waiting for model response"

**Problem:** LLM is taking too long to respond

**Causes & Solutions:**

1. **Model not fully downloaded**: Check with `ollama list`
2. **System too slow**: Using 7B model? Try 3B: `ollama pull mistral:3b-instruct-q4_K_M`
3. **RAM low**: Close other apps; 16 GB should be enough
4. **CPU bottleneck**: This is expected on i5-1155G7; responses take 5-10 seconds

---

## Database Issues

### "Database locked" or "cannot open"

**Problem:** SQLite database is locked or corrupted

**Solution:**

```bash
# For Phase 1 (using SQLite), try deleting and recreating
rm backend/conversations.db
# Database will be recreated automatically on next run
```

---

### "PostgreSQL connection refused"

**Problem:** PostgreSQL not running (for future phases)

**Solution:**

```bash
# Check if running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection in .env
# DATABASE_URL=postgresql://user:password@localhost/db_name
```

---

## Performance Issues

### **(Phase 1) Responses are very slow (30+ seconds)**

**Problem:** Using a large model on CPU

**Solutions:**

1. **Verify you're using 3B model:**

   ```bash
   grep OLLAMA_MODEL backend/.env
   # Should be: mistral:3b-instruct-q4_K_M
   ```

2. **Check available RAM:**

   ```bash
   free -h
   # Should show > 8 GB available
   ```

3. **Monitor CPU/Memory during response:**

   ```bash
   # In another terminal
   top
   # Watch for python process using resources
   ```

4. **Expected response times:**
   - Mistral 3B on CPU: 5-10 seconds ✓ (normal)
   - Mistral 7B on CPU: 30-60 seconds (slow)
   - With GPU: 1-2 seconds (future optimization)

---

### High memory usage

**Problem:** Backend using too much RAM

**Solutions:**

```bash
# Check memory
free -h

# Monitor Python process
ps aux | grep python

# If too high:
# 1. Close other apps
# 2. Use smaller model (3B instead of 7B)
# 3. Restart backend
```

---

## Development Issues

### "Changes not reflecting" when code is edited

**Problem:** Backend not auto-reloading

**Solution:**

```bash
# Use reload flag
python -m uvicorn main:app --reload

# Or restart manually
# Ctrl+C to stop, then run again
python main.py
```

---

### Debugging

**Enable debug logging:**

```bash
# In main.py, ensure DEBUG is True
# Or set env variable
export DEBUG=True
python main.py

# Check logs in data/logs/
tail -f data/logs/*.log
```

---

## Getting Help

1. **Check this file first** for your error
2. **Check [PROJECT_PLAN.md](../PROJECT_PLAN.md)** for architecture
3. **Check [PHASE_STATUS.md](../PHASE_STATUS.md)** for current known issues
4. **Check logs:** `data/logs/*.log`
5. **Verify environment:**

   ```bash
   # Run health check
   curl http://localhost:8000/health
   
   # Run info endpoint
   curl http://localhost:8000/info
   ```

---

## Report Issues

When something breaks:

1. Note exact error message
2. Check the relevant section above
3. If still broken, update [PHASE_STATUS.md](../PHASE_STATUS.md) with:
   - What you were doing
   - Exact error
   - Steps to reproduce
4. Any future AI agent will see it and help fix

---

**Still stuck?** Document it and let the next agent know!
