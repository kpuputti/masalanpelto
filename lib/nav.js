exports.getNav = function (active, session) {

    var paths = [
        {path: '/', name: 'Etusivu'},
        {path: '/tietoa', name: 'Tietoa'}
    ];

    if (session && session.loggedIn) {
        paths.push({ path: '/test', name: 'Test' });
    }

    if (session && session.username === 'asukas') {
        paths.push({ path: '/asukkaille', name: 'Asukkaille' });
    }

    if (session && session.username === 'hallitus') {
        paths.push({ path: '/asukkaille', name: 'Asukkaille' });
        paths.push({ path: '/hallitus', name: 'Hallitus' });
    }

    if (session && session.username === 'admin') {
        paths.push({ path: '/asukkaille', name: 'Asukkaille' });
        paths.push({ path: '/hallitus', name: 'Hallitus' });
        paths.push({ path: '/admin', name: 'Admin' });
    }

    return paths.map(function (item) {
        item.active = item.path === active;
        return item;
    });
};
