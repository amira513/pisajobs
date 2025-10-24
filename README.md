Il progetto PisaJobs contiene due cartelle sia il frontend(pisajobs_frontend) che il backend (pisajobs_backend)
 e usa concurrently per farla avviare insieme.


# PisaJobs frontend

Questo è il frontend per PisaJobs, un'app per cercare e offrire lavori, sviluppata con Vite + React

# Tecnologia

- Vite + React

# Installazione

- Clona il progetto : cd pisajobs_frontend 
- Avvia il progetto: npm run dev



-------------------------------------------------------------------

# PisaJobs Backend

Questo è il backend per PisaJobs, un'app per cercare e offrire lavori, sviluppata con Django e Django REST Framework.

# Tecnologie

- Django
- Django REST Framework
- JWT (per gestire login e autenticazione)

# Come usarlo

- Dalla root del progetto (PisaJobs/): `python -m venv venv`
- Attiva l’ambiente virtuale (es. `source ./venv/bin/activate` su Linux/macOS)
- Installa le dipendenze: `pip install -r requirements.txt`

# Requisiti

Assicurati di avere installato i seguenti pacchetti Python 

- asgiref==3.9.2
- Django==5.2.7
- django-cors-headers==4.9.0
- djangorestframework==3.16.1
- djangorestframework_simplejwt==5.5.1
- PyJWT==2.10.1
- sqlparse==0.5.3

- Entra nella cartella `pisajobs_backend/`
- Applica le migrazioni per creare il database: `python manage.py migrate`
- Crea un superuser per accedere all’admin: `python manage.py createsuperuser`
- Avvia il server: `python manage.py runserver`

# API principali

- Registrazione: crea un nuovo account
- Login: accedi con username e password
- Profilo: vedi i tuoi dati personali (solo se sei loggato).

# Admin

Nel pannello di amministrazione di Django puoi gestire utenti, annunci, candidature, lavori salvati e notifiche in modo semplice, con filtri e ricerche.



## Avvio simultaneo (frontend + backend)

Dopo aver completato l’installazione dei requisiti, puoi avviare entrambi i server con un solo comando:

```bash
npm install        # Installa concurrently (solo al primo avvio)
npm run dev        # Avvia frontend e backend insieme