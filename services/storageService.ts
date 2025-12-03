import { AppState, UserProfile, AppTab } from '../types';

const STORAGE_KEY = 'garbhVedaAppState';
const STORAGE_VERSION = 1;
const LEGACY_USER_KEY = 'garbhVedaUser';

/**
 * Storage Service - Centralized data persistence using localStorage
 * Handles versioning, migrations, and type-safe storage operations
 */
class StorageService {
    private state: AppState;

    constructor() {
        this.state = this.loadState();
    }

    /**
     * Load state from localStorage with migration support
     */
    private loadState(): AppState {
        try {
            // Check for new storage format
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: AppState = JSON.parse(stored);
                console.log('[Storage] Loaded state from new format', parsed);
                return this.migrateIfNeeded(parsed);
            }

            // Check for legacy format
            const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
            if (legacyUser) {
                console.log('[Storage] Migrating from legacy format');
                const user: UserProfile = JSON.parse(legacyUser);

                // Ensure all required fields exist for backward compatibility
                this.ensureUserFields(user);

                const migratedState: AppState = {
                    version: STORAGE_VERSION,
                    user,
                    activeTab: AppTab.HOME,
                    volume: 0.7,
                    generatedImages: {},
                    completedActivities: [],
                    lastSync: new Date().toISOString()
                };

                // Save in new format
                this.saveState(migratedState);

                // Remove legacy key
                localStorage.removeItem(LEGACY_USER_KEY);

                return migratedState;
            }

            // No existing data
            console.log('[Storage] No existing data found');
            return this.getDefaultState();
        } catch (error) {
            console.error('[Storage] Error loading state:', error);
            return this.getDefaultState();
        }
    }

    /**
     * Ensure user has all required fields for backward compatibility
     */
    private ensureUserFields(user: UserProfile): void {
        if (!user.dreamJournal) user.dreamJournal = [];
        if (!user.role) user.role = 'MOM' as any;
        if (user.sevaPoints === undefined) user.sevaPoints = 0;
        if (!user.sevaHistory) user.sevaHistory = [];
        if (!user.promises) user.promises = [];
        if (!user.pitraVaniHistory) user.pitraVaniHistory = [];
        if (!user.chatHistory) user.chatHistory = [];
        if (!user.scrapbook) user.scrapbook = [];
        if (!user.yogaProgress) user.yogaProgress = [];
        if (!user.dietFavorites) user.dietFavorites = [];
    }

    /**
     * Migrate state to current version if needed
     */
    private migrateIfNeeded(state: AppState): AppState {
        if (state.version === STORAGE_VERSION) {
            return state;
        }

        console.log(`[Storage] Migrating from version ${state.version} to ${STORAGE_VERSION}`);

        // Future migrations will go here
        // Example:
        // if (state.version < 2) {
        //   state = this.migrateV1toV2(state);
        // }

        state.version = STORAGE_VERSION;
        this.saveState(state);
        return state;
    }

    /**
     * Get default/empty state
     */
    private getDefaultState(): AppState {
        return {
            version: STORAGE_VERSION,
            user: null,
            activeTab: AppTab.HOME,
            volume: 0.7,
            generatedImages: {},
            completedActivities: [],
            lastSync: new Date().toISOString()
        };
    }

    /**
     * Save state to localStorage
     */
    private saveState(state: AppState): void {
        try {
            state.lastSync = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            console.log('[Storage] State saved successfully');
        } catch (error) {
            console.error('[Storage] Error saving state:', error);

            // Handle quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('[Storage] Storage quota exceeded. Consider cleaning old data.');
                // Could implement auto-cleanup of old data here
            }
        }
    }

    // ===== Public API =====

    /**
     * Get current user profile
     */
    getUser(): UserProfile | null {
        return this.state.user;
    }

    /**
     * Set user profile
     */
    setUser(user: UserProfile | null): void {
        this.state.user = user;
        this.saveState(this.state);
    }

    /**
     * Update user profile
     */
    updateUser(updates: Partial<UserProfile>): void {
        if (!this.state.user) return;
        this.state.user = { ...this.state.user, ...updates };
        this.saveState(this.state);
    }

    /**
     * Get active tab
     */
    getActiveTab(): AppTab {
        return this.state.activeTab;
    }

    /**
     * Set active tab
     */
    setActiveTab(tab: AppTab): void {
        this.state.activeTab = tab;
        this.saveState(this.state);
    }

    /**
     * Get volume setting
     */
    getVolume(): number {
        return this.state.volume;
    }

    /**
     * Set volume setting
     */
    setVolume(volume: number): void {
        this.state.volume = volume;
        this.saveState(this.state);
    }

    /**
     * Get generated image for an activity
     */
    getGeneratedImage(activityId: string): string | undefined {
        return this.state.generatedImages[activityId];
    }

    /**
     * Save generated image for an activity
     */
    setGeneratedImage(activityId: string, imageUrl: string): void {
        this.state.generatedImages[activityId] = imageUrl;
        this.saveState(this.state);
    }

    /**
     * Mark activity as completed
     */
    markActivityCompleted(activityId: string): void {
        if (!this.state.completedActivities.includes(activityId)) {
            this.state.completedActivities.push(activityId);
            this.saveState(this.state);
        }
    }

    /**
     * Check if activity is completed
     */
    isActivityCompleted(activityId: string): boolean {
        return this.state.completedActivities.includes(activityId);
    }

    /**
     * Get entire app state (for debugging/export)
     */
    getState(): AppState {
        return { ...this.state };
    }

    /**
     * Reset all data - clear everything
     */
    resetAll(): void {
        console.log('[Storage] Resetting all data');
        this.state = this.getDefaultState();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_USER_KEY); // Also remove legacy if it exists
        console.log('[Storage] All data cleared');
    }

    /**
     * Export data as JSON (for backup)
     */
    exportData(): string {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import data from JSON (for restore)
     */
    importData(jsonData: string): boolean {
        try {
            const imported: AppState = JSON.parse(jsonData);
            this.state = this.migrateIfNeeded(imported);
            this.saveState(this.state);
            console.log('[Storage] Data imported successfully');
            return true;
        } catch (error) {
            console.error('[Storage] Error importing data:', error);
            return false;
        }
    }
}

// Export singleton instance
export const storage = new StorageService();
