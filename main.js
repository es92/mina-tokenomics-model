window.onload = () => {

  // things to show
  // % yield
  // % inflation
  // total tokens
  // fees

  var schedule = Schedule();

  var chart = document.getElementById("chart");

  var month2blockReward = schedule.month2blockReward;
  var month2superchargedReward = schedule.month2superchargedReward;
  var month2fees = schedule.month2fees;
  var month2feeBurn = schedule.month2feeBurn;

  var results = Model(month2blockReward, month2superchargedReward, month2fees, month2feeBurn);
  schedule.fillYields(results.yield, results.superchargedYield);

  var tc = TokenChart(chart, results);

  schedule.onchange(() => {
    var results = Model(month2blockReward, month2superchargedReward, month2fees, month2feeBurn);
    schedule.fillYields(results.yield, results.superchargedYield);
    tc.update(results);
  });
}
