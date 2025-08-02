private async saveToBackend(): Promise<void> {
    for (const [sessionId, session] of this.sessions.entries()) {
      await this.backend.store(sessionId, session, 'session');
    }
  }