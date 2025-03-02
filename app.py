from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mood_tracker.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mood = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        if "username" not in data:
            return jsonify({"message": "Missing required fields"}), 400

        new_user = User(username=data['username'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create user: {str(e)}'}), 500

@app.route('/log_mood', methods=['POST'])
def log_mood():
    try:
        data = request.json
        if "user_id" not in data or "mood" not in data or "date" not in data:
            return jsonify({"message": "Missing required fields"}), 400

        date_str = data['date']

        try:
            date_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError as ve:
            return jsonify({"message": f"Invalid date format: {str(ve)}"}), 400

        new_log = MoodLog(user_id=data['user_id'], mood=data['mood'], date=date_object)
        db.session.add(new_log)
        db.session.commit()
        return jsonify({'message': 'Mood logged!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to log mood: {str(e)}'}), 500


@app.route('/mood_logs', methods=['GET'])
def get_mood_logs():
    try:
        mood_logs = MoodLog.query.all()
        data = []
        for log in mood_logs:
            data.append({
                'id': log.id,
                'user_id': log.user_id,
                'mood': log.mood,
                'date': log.date.isoformat(),
            })
        return jsonify(data)
    except Exception as e:
        return jsonify({'message': f'Failed to fetch mood logs: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
