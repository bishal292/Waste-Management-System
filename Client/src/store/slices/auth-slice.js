export const createAuthSlice = (set) => (
    {
        userInfo: undefined, // Initialize as null to represent unauthenticated state
        setUserInfo: (userInfo) => set(() => ({ userInfo })),
    }
);