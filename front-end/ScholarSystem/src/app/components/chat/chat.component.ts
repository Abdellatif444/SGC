import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  user: string;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatComponent {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  username: string = '';
  isLoadingLLM: boolean = false;
  notConnected: boolean = false;

  constructor(private http: HttpClient) {
    // Charger les messages depuis le stockage local (pour la démo)
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      this.messages = JSON.parse(saved).map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
    }
    // Utiliser le nom d'utilisateur authentifié
    const user = localStorage.getItem('username');
    if (user && user !== 'null' && user !== 'undefined' && user.trim() !== '') {
      this.username = user;
      this.notConnected = false;
    } else {
      this.username = 'Anonyme';
      this.notConnected = true;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    const msg: ChatMessage = {
      user: this.username || 'Anonyme',
      content: this.newMessage,
      timestamp: new Date()
    };
    this.messages.push(msg);
    this.newMessage = '';
    // Sauvegarder dans le stockage local
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
    setTimeout(() => this.scrollToBottom(), 100);
  }

  askLLM() {
    if (!this.newMessage.trim()) return;
    const userMsg: ChatMessage = {
      user: this.username || 'Anonyme',
      content: this.newMessage,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    const prompt = this.newMessage;
    this.newMessage = '';
    this.isLoadingLLM = true;
    // Appel à l'API backend locale
    const accessToken = localStorage.getItem('access_token');
    this.http.post('/api/chatbot/ask/', {
      query: prompt
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res: any) => {
        const botMsg: ChatMessage = {
          user: 'IA',
          content: res.answer,
          timestamp: new Date()
        };
        this.messages.push(botMsg);
        localStorage.setItem('chat_messages', JSON.stringify(this.messages));
        setTimeout(() => this.scrollToBottom(), 100);
        this.isLoadingLLM = false;
      },
      error: (err) => {
        let errorMsg = "Erreur lors de la communication avec l'IA.";
        if (err && err.error) {
          try {
            const errObj = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            if (errObj && errObj.error && errObj.error.message) {
              errorMsg = errObj.error.message;
            }
          } catch {}
        }
        const botMsg: ChatMessage = {
          user: 'IA',
          content: errorMsg,
          timestamp: new Date()
        };
        this.messages.push(botMsg);
        this.isLoadingLLM = false;
      }
    });
  }

  scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  resetMessages() {
    this.messages = [];
    localStorage.removeItem('chat_messages');
  }
}
