export default defineNuxtRouteMiddleware(async to => {
    const { user, authChecked, fetchUser } = useAuth();
    const publicPages = ['/login'];

    if (!authChecked.value) {
        await fetchUser();
    }

    if (!publicPages.includes(to.path) && !user.value) {
        return navigateTo('/login');
    }

    if (to.path === '/login' && user.value) {
        return navigateTo('/tasks');
    }
});
