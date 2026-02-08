# ============================================
# Heroku Procfile - DJ Yazan
# ============================================
# web: Servidor do site (dyno web)
# worker: Bot Discord (dyno worker)
# 
# Para manutenção:
# - Desative o dyno worker para manter só o site
# - Desative o dyno web para manter só o bot
# ============================================

web: node web/standalone.js
worker: node index.js