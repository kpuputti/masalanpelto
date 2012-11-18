exports.getNav = function (active, session) {

    var paths = [
        {path: '/', name: 'Etusivu'},
        {path: '/tietoa', name: 'Tietoa'}
    ];

    if (session && session.loggedIn) {
        paths.push({
            path: '/test',
            name: 'Test'
        });
    }

    return paths.map(function (item) {
        item.active = item.path === active;
        return item;
    });
};
