

var Model = (month2blockReward, month2superchargedReward, month2fees, month2feeBurn) => {
  var genesisSupply = circulating[Math.max.apply(Math, Object.keys(circulating))]

  var f = .75; // f is a protocol parameter that determines % of slots with a block

  var months = 12*6;

  var slotsPerDay = 24*3600/180;
  var slotsPerMonth = slotsPerDay*30;

  var slot2blockReward = (s) => month2blockReward(s/slotsPerMonth);
  var slot2superchargedBlockReward = (s) => month2superchargedReward(s/slotsPerMonth);

  var slot2fees = (s) => month2fees(s/slotsPerMonth);
  var slot2feeBurn = (s) => month2feeBurn(s/slotsPerMonth);

  var accounts = {};

  var slots = new Array(months).fill(null).map((_, month) => slotsPerMonth*month);

  var state = {
    locked: genesisSupply - circulating[0],
    unlocked: circulating[0],
    slot: 0
  }

  var stepState = (state) => {
    var totalSupply = state.locked + state.unlocked;
    var expectedBlocks = slotsPerMonth*f;

    var fees = slot2fees(state.slot);
    var feeBurn = slot2feeBurn(state.slot);

    var totalFeeRewards = fees*(1-feeBurn)*expectedBlocks;
    var totalFeeBurn = fees*feeBurn*expectedBlocks;

    var blockReward = slot2blockReward(state.slot)
    var superchargedReward = slot2superchargedBlockReward(state.slot);

    var newRewards;

    if (superchargedReward != null) {
      var newBlockRewards = state.locked/totalSupply*expectedBlocks*blockReward;
      var newSuperchargedRewards = state.unlocked/totalSupply*expectedBlocks*superchargedReward;
      var newRewards = newBlockRewards + newSuperchargedRewards;
    } else {
      var newBlockRewards = expectedBlocks*blockReward;
      var newSuperchargedRewards = null;
      var newRewards = newBlockRewards;
    }

    var newlyUnlocked = circulating[state.slot+slotsPerMonth] - circulating[state.slot];
    if (newlyUnlocked != null) {
      state.locked -= newlyUnlocked;
      state.unlocked += newlyUnlocked;
    }
    state.unlocked += newRewards
    state.slot += slotsPerMonth;
    state.unlocked -= totalFeeBurn;

    state.blockRewardYield = expectedBlocks*blockReward*12/totalSupply;
    state.superchargedYield = expectedBlocks*superchargedReward*12/totalSupply;
    state.inflation = (newRewards - totalFeeBurn)*12/totalSupply;
    state.totalYield = (expectedBlocks*blockReward + totalFeeRewards)*12/totalSupply
    state.totalSuperchargedYield = (expectedBlocks*superchargedReward + totalFeeRewards)*12/totalSupply
    state.fees = totalFeeRewards + totalFeeBurn;
    state.feePercent = feeBurn
    return state;
  }

  var totalTokens = [];
  var yield = [];
  var superchargedYield = [];
  var inflation = [];
  var totalYield = [];
  var fees = [];
  var totalSuperchargedYield = [];
  var feePercent = [];

  for (var m = 0; m < months; m++) {
    totalTokens.push(state.locked + state.unlocked);
    state = stepState(state);

    yield.push(state.blockRewardYield);
    superchargedYield.push(state.superchargedYield);
    inflation.push(state.inflation);
    totalYield.push(state.totalYield);
    totalSuperchargedYield.push(state.totalSuperchargedYield);
    fees.push(state.fees);
    feePercent.push(state.feePercent);
  }

  return {
    'labels': slots.map((_, i) => i),
    'totalTokens': totalTokens,
    'superchargedYield': superchargedYield,
    'yield': yield,
    'totalYield': totalYield,
    'inflation': inflation,
    'fees': fees,
    'totalSuperchargedYield': totalSuperchargedYield,
    'feePercent': feePercent
  }
}
