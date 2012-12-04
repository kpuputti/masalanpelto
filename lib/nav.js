'use strict';

exports.getNav = function (active, session) {

    var pageHome = { path: '/', name: 'Etusivu' };
    var pageTietoa = { path: '/tietoa', name: 'Tietoa' };
    var pageAsiakirjat = { path: '/asiakirjat', name: 'Asiakirjat' };
    var pageTest = { path: '/test', name: 'Test' };
    var pageAsukkaille = { path: '/asukkaille', name: 'Asukkaille' };
    var pageHallitus = { path: '/hallitus', name: 'Hallitus' };
    var pageAdmin = { path: '/admin', name: 'Admin' };

    var pathsConfig = {

        asukas: [
            pageHome,
            pageTietoa,
            pageAsiakirjat,
            pageAsukkaille
        ],

        hallitus: [
            pageHome,
            pageTietoa,
            pageAsiakirjat,
            pageAsukkaille,
            pageHallitus
        ],

        admin: [
            pageHome,
            pageTietoa,
            pageAsiakirjat,
            pageAsukkaille,
            pageHallitus,
            pageTest,
            pageAdmin
        ]
    };

    var pathsAll = [
        pageHome,
        pageTietoa,
        pageAsiakirjat
    ];

    var username = session ? session.username : null;
    var paths = [];

    if (username && pathsConfig.hasOwnProperty(username)) {
        paths = pathsConfig[username];
    } else {
        paths = pathsAll;
    }

    function setActive(item) {
        item.active = item.path === active;
        return item;
    }

    return paths.map(setActive);
};
