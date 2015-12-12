
function getUsers(req, res) {
    res.render('userList', []);
}

module.exports = {
    getUsers: getUsers
};