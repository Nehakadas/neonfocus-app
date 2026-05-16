unzip neonfocus.zip
gcloud run deploy neonfocus-app --source .
npm install serve
nano package.json
sed -i '/"preview":/a \    "start": "serve -s dist -l 8080",' package.json
gcloud run deploy neonfocus-app --source .
git add .
git commit -m "Add production start script for Cloud Run"
git remote add origin https://github.com/Nehakadas/neonfocus-app.git
git push -u origin main
git init
