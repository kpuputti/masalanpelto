exports.getNav = function (active) {
    return [
        {path: '/', name: 'Etusivu'},
        {path: '/tietoa', name: 'Tietoa'}
    ].map(function (item) {
        item.active = item.path === active;
        return item;
    });
};
