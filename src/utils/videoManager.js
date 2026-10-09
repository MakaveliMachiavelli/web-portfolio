// Global video coordinator: ensures at most one video stream plays at any given time
class VideoManager {
  constructor() {
    this.controllers = new Map();
    this.activeId = null;
  }

  register(id, controller) {
    this.controllers.set(id, controller);
    return () => {
      this.controllers.delete(id);
      if (this.activeId === id) {
        this.activeId = null;
      }
    };
  }

  requestPlay(id) {
    this.controllers.forEach((ctrl, key) => {
      if (key !== id) {
        try {
          ctrl.pause();
        } catch {
          // ignore error
        }
      }
    });

    this.activeId = id;
    const target = this.controllers.get(id);
    if (target?.play) {
      try {
        target.play();
      } catch {
        // ignore error
      }
    }
  }

  requestPause(id) {
    if (this.activeId === id) {
      this.activeId = null;
    }
    const target = this.controllers.get(id);
    if (target?.pause) {
      try {
        target.pause();
      } catch {
        // ignore error
      }
    }
  }

  getActiveId() {
    return this.activeId;
  }
}

export const videoManager = new VideoManager();
