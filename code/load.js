module.exports = function() {
  for (var i = 0; i < arguments.length; i++)
    (1,eval)(require("fs").readFileSync(__dirname + "/../" + arguments[i], "utf8"));
};
