exports.SolarDays = function(m) {
    if (m == 4 || m == 6 || m == 9 || m == 11) {
      return 30
    }
    if (m == 2) {
      return 29
    }
    return 31
}

exports.LunarDays = function () {
  return 30
}