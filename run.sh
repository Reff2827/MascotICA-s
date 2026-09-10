#!/bin/bash
# Pet Shop - Panel Admin (version web simple)
# Abre index.html en el navegador por defecto de Mac/Linux.
cd "$(dirname "$0")"

if command -v open >/dev/null 2>&1; then
    open "index.html"          # macOS
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "index.html"      # Linux
else
    echo "No se pudo detectar un comando para abrir el navegador."
    echo "Abre manualmente el archivo index.html con tu navegador."
fi
