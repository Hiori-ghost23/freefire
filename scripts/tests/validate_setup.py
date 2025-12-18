#!/usr/bin/env python3
"""
Script de validation complète du projet FreeFire MVP
Teste tous les composants pour s'assurer que l'installation est correcte
"""
import requests
import time
import subprocess
import sys
import os
from datetime import datetime

class FreefireValidator:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.test_results = []
        
    def log(self, message, status="info"):
        """Log avec couleur"""
        colors = {
            "info": "\033[94m",    # Bleu
            "success": "\033[92m", # Vert
            "warning": "\033[93m", # Jaune
            "error": "\033[91m",   # Rouge
            "end": "\033[0m"       # Reset
        }
        
        icon = {
            "info": "ℹ️",
            "success": "✅", 
            "warning": "⚠️",
            "error": "❌"
        }
        
        print(f"{colors.get(status, '')}{icon.get(status, '')} {message}{colors['end']}")

    def test_docker_services(self):
        """Teste que les services Docker sont en cours d'exécution"""
        self.log("Test des services Docker...", "info")
        
        try:
            result = subprocess.run(
                ["docker-compose", "ps", "--services", "--filter", "status=running"],
                capture_output=True, text=True, timeout=10
            )
            
            if result.returncode == 0:
                services = result.stdout.strip().split('\n')
                expected_services = ['db', 'api', 'minio', 'mailhog', 'adminer']
                
                for service in expected_services:
                    if service in services:
                        self.log(f"Service {service} ✓", "success")
                    else:
                        self.log(f"Service {service} non démarré", "error")
                        return False
                        
                return True
            else:
                self.log("Erreur lors de la vérification des services Docker", "error")
                return False
                
        except Exception as e:
            self.log(f"Erreur Docker: {e}", "error")
            return False

    def test_api_health(self):
        """Teste que l'API répond"""
        self.log("Test de l'API principale...", "info")
        
        try:
            # Attendre que l'API soit prête
            max_retries = 10
            for i in range(max_retries):
                try:
                    response = requests.get(f"{self.base_url}/health", timeout=5)
                    if response.status_code == 200:
                        self.log("API Health Check ✓", "success")
                        return True
                except requests.exceptions.RequestException:
                    if i < max_retries - 1:
                        self.log(f"Tentative {i+1}/{max_retries}... Attente de l'API", "warning")
                        time.sleep(3)
                    continue
            
            self.log("API non accessible après plusieurs tentatives", "error")
            return False
            
        except Exception as e:
            self.log(f"Erreur API Health: {e}", "error")
            return False

    def test_database_connection(self):
        """Teste la connexion à la base de données"""
        self.log("Test de la base de données...", "info")
        
        try:
            # Test via l'endpoint API qui utilise la DB
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "ok":
                    self.log("Connexion base de données ✓", "success")
                    return True
            
            self.log("Base de données non accessible", "error")
            return False
            
        except Exception as e:
            self.log(f"Erreur base de données: {e}", "error")
            return False

    def test_api_endpoints(self):
        """Teste les principaux endpoints de l'API"""
        self.log("Test des endpoints principaux...", "info")
        
        endpoints = [
            ("/", "GET", "Endpoint racine"),
            ("/health", "GET", "Health check"),
            ("/docs", "GET", "Documentation Swagger"),
            ("/openapi.json", "GET", "Schema OpenAPI")
        ]
        
        success_count = 0
        
        for endpoint, method, description in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                    
                if response.status_code == 200:
                    self.log(f"{description} ✓", "success")
                    success_count += 1
                else:
                    self.log(f"{description} - Status {response.status_code}", "error")
                    
            except Exception as e:
                self.log(f"{description} - Erreur: {e}", "error")
        
        return success_count == len(endpoints)

    def test_external_services(self):
        """Teste les services externes (Adminer, MinIO, MailHog)"""
        self.log("Test des services externes...", "info")
        
        services = [
            ("http://localhost:8081", "Adminer (DB Admin)"),
            ("http://localhost:9001", "MinIO Console"),
            ("http://localhost:8025", "MailHog (Email)")
        ]
        
        success_count = 0
        
        for url, name in services:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    self.log(f"{name} ✓", "success")
                    success_count += 1
                else:
                    self.log(f"{name} - Status {response.status_code}", "warning")
            except Exception as e:
                self.log(f"{name} - Non accessible: {e}", "warning")
        
        return success_count >= 2  # Au moins 2 services sur 3 doivent marcher

    def test_project_structure(self):
        """Vérifie la structure du projet"""
        self.log("Vérification de la structure du projet...", "info")
        
        # Obtenir le répertoire du script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.join(script_dir, '..', '..')
        project_root = os.path.abspath(project_root)
        
        required_files = [
            "README.md",
            "docker-compose.yml",
            "api/app/main.py",
            "api/app/models.py",
            "api/app/schemas.py",
            "api/Dockerfile",
            "api/requirements.txt",
            "database/migrations/001_init.sql",
            "database/seeds/002_catalog.sql"
        ]
        
        missing_files = []
        
        for file_path in required_files:
            full_path = os.path.join(project_root, file_path)
            if os.path.exists(full_path):
                self.log(f"Fichier {file_path} ✓", "success")
            else:
                self.log(f"Fichier {file_path} manquant", "error")
                missing_files.append(file_path)
        
        return len(missing_files) == 0

    def run_all_tests(self):
        """Lance tous les tests"""
        self.log("🚀 VALIDATION FREFIRE MVP - DÉBUT", "info")
        self.log("=" * 50, "info")
        
        tests = [
            ("Structure du projet", self.test_project_structure),
            ("Services Docker", self.test_docker_services),
            ("API Health", self.test_api_health),
            ("Base de données", self.test_database_connection),
            ("Endpoints API", self.test_api_endpoints),
            ("Services externes", self.test_external_services)
        ]
        
        results = []
        
        for test_name, test_func in tests:
            self.log(f"\n📋 {test_name}...", "info")
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                self.log(f"Erreur inattendue dans {test_name}: {e}", "error")
                results.append((test_name, False))
        
        # Rapport final
        self.log("\n" + "=" * 50, "info")
        self.log("📊 RAPPORT FINAL", "info")
        self.log("=" * 50, "info")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "success" if result else "error"
            icon = "✅" if result else "❌"
            self.log(f"{icon} {test_name}", status)
        
        self.log(f"\n📈 Résultat: {passed}/{total} tests réussis", "info")
        
        if passed == total:
            self.log("🎉 SUCCÈS COMPLET ! Votre installation FreeFire MVP est prête !", "success")
            self.log("🌐 API: http://localhost:8080", "info")
            self.log("📚 Documentation: http://localhost:8080/docs", "info")
            self.log("💾 Base de données: http://localhost:8081", "info")
            self.log("📁 Stockage: http://localhost:9001", "info")
            self.log("📧 Emails: http://localhost:8025", "info")
            return True
        else:
            self.log(f"⚠️ {total - passed} tests ont échoué", "warning")
            self.log("📋 Consultez les messages d'erreur ci-dessus", "info")
            self.log("📖 Voir README.md pour le dépannage", "info")
            return False

def main():
    """Fonction principale"""
    validator = FreefireValidator()
    success = validator.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
