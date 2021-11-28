

var Schedule = () => {

  var customTable = {
    checked: false,
    data: null,
  };

  var customFeeTable = {
    checked: false,
    data: null,
  };

  var e = {
    onchange: null
  }

  var leftUnchanged = {
    month2blockReward: (m) => 720,
    month2superchargedReward: (m) => 1440,
    month2feeBurn: (m) => 0,
  }

  var originalTokenomics = {
    month2blockReward: (m) => [720, 720, 720, 820, 850, 880, 910, 935, 880, 910, 850, 870, 800, 820, 740, 760, 680, 690, 700, 710, 725, 740, 755, 770, 790,][Math.floor(m/3)],
    month2superchargedReward: (m) => [1440, 1440, 1440, 1235, 1060, ].concat(new Array(100).fill(''))[Math.floor(m/3)],
    month2feeBurn: (m) => 0,
  }

  var proposedBRs = [720, 720, 720, 720, 720, 675, 675, 625, 625, 575, 575, 525, 525, 475, 475, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450 ];

  var proposedTokenomics = {
    month2blockReward: (m) => proposedBRs[Math.floor(m/3)],
    month2superchargedReward: (m) => [1440, 1440, 1440, 1235, 1060, ].concat(new Array(100).fill(''))[Math.floor(m/3)],
    month2feeBurn: (m) => [0, 0, 0, 0, 0, 0, 0, .1, .1, .1, .1, .25, .25, .25, .25, .33, .33, .33, .33].concat(new Array(100).fill(.5))[Math.floor(m/3)],
  }

  var proposedTokenomicsNoBurn = {
    month2blockReward: (m) => proposedBRs[Math.floor(m/3)],
    month2superchargedReward: (m) => [1440, 1440, 1440, 1235, 1060, ].concat(new Array(100).fill(''))[Math.floor(m/3)],
    month2feeBurn: (m) => new Array(100).fill(0)[Math.floor(m/3)],
  }

  var makeCustom = () => {
    var each = new Array(3).fill(null).map((_, i) => {
      return (m) => {
        if (customTable.data != null) {
          if (i == 2) {
            return customTable.data[i][Math.floor(m/3)]/100;
          } else {
            return customTable.data[i][Math.floor(m/3)];
          }
        } else {
          return null;
        }
      }
    });
    return {
      month2blockReward: each[0],
      month2superchargedReward: each[1],
      month2feeBurn: each[2],
    }
  }


  var radios = {
    'left unchanged': leftUnchanged,
    'orignal tokenomics': originalTokenomics,
    'proposed tokenomics (no fee burning)': proposedTokenomicsNoBurn,
    'proposed tokenomics (with fee burning)': proposedTokenomics,
    'custom': makeCustom()
  }

  var startingSchedule = 3;

  var ethAveragesPerDayByYear = [
    0, // 2015
    0, // 2016
    500, // 2017
    500, // 2018
    500, // 2019
    5000, // 2020 onward
    10000, // 2021 onward
  ]
  // ~100m eth, so 1/10,000 of eth sent around in fees each day
  // if ~1b Mina - then grow to 1e5 Mina per day
  // per block, that's 1e5/(24*20*.75), or ~280

  var pricePerMina = 5;

  var as_fast_schedule = [].concat(
                            new Array(4).fill(0),
                            new Array(4).fill(20),
                            new Array(4).fill(100),
                            new Array(4).fill(280),
                            new Array(4).fill(360),
                            new Array(5).fill(420),
                         );

  var feeRadios = {
    'no fees': (m) => 0,
    'fee growth to 1/40,000th of the supply per day (1/2th Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3)]/4,
    'fee growth to 1/20,000th of the supply per day (1/4th Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3)]/2,
    'fee growth to 1/10,000th of the supply per day (same as Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3)],
    'fee growth to 1/5,000th of the supply per day (2x Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3)]*2,
    'fee growth to 1/2,500th of the supply per day (4x Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3)]*4,
    'custom': (m) => {
      if (customFeeTable.data != null) {
        return customFeeTable.data[0][Math.floor(m/3)]
      } else {
        return null;
      }
    }
  }

  // file:///Users/evanshapiro/Desktop/gits/mina-inflation-model/index.html

  var startingFeeSchedule = 4;

  var updateTable = () => {
    var schedule = document.querySelector('input[name="schedule"]:checked').value;
    var feeSchedule = document.querySelector('input[name="fees"]:checked').value;

    model = radios[schedule];

    month2fees = feeRadios[feeSchedule]

    quarters.forEach((q, i) => {
      if (schedule != 'custom' || customTable.data != null) {
        setCell(0, i, model.month2blockReward(q));
        setCell(2, i, model.month2superchargedReward(q));
        setCell(4, i, model.month2feeBurn(q)*100);
      }
    });
    quarters.forEach((q, i) => {
      if (feeSchedule != 'custom' || customFeeTable.data != null) {
        setCell(5, i, month2fees(q));
      }
    });

    if (schedule == 'custom') {
      customTable.checked = true;
      saveCustomTable();
    } else {
      customTable.checked = false;
      saveCustomTable();
    }

    if (feeSchedule == 'custom') {
      customFeeTable.checked = true;
      saveCustomTable();
    } else {
      customFeeTable.checked = false;
      saveCustomTable();
    }

    if (e.onchange != null) {
      e.onchange();
    }
  }

  // ============================================================

  var radiosDiv = document.getElementById('radios');

  Object.keys(radios).forEach((r, i) => {
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.value = r;
    radio.name = 'schedule';
    radio.onchange = updateTable;
    var label = document.createElement('label');
    label.innerText = r;
    radiosDiv.appendChild(radio);
    radiosDiv.appendChild(label);
    radiosDiv.appendChild(document.createElement('br'));
    
    if (i == startingSchedule) {
      radio.checked = 'checked';
    }
  });

  var feeRadiosDiv = document.getElementById('fee-radios');

  Object.keys(feeRadios).forEach((r, i) => {
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.value = r;
    radio.name = 'fees';
    radio.onchange = updateTable;
    var label = document.createElement('label');
    label.innerText = r;
    feeRadiosDiv.appendChild(radio);
    feeRadiosDiv.appendChild(label);
    feeRadiosDiv.appendChild(document.createElement('br'));
    
    if (i == startingFeeSchedule) {
      radio.checked = 'checked';
    }
  });

  // ============================================================

  var round3 = (r) => Math.round(r*10e2)/10e2;

  var quarters = new Array(72/3).fill(null).map((_, i) => i*3);

  var rows = [ 
    [ '' ].concat(quarters),
    [ 'block reward' ].concat(quarters.map(() => '<i>')),
    [ 'block reward yield %' ].concat(quarters.map(() => '<i>')),
    [ 'supercharged reward', ].concat(quarters.map(() => '<i>')),
    [ 'supercharged reward yield %', ].concat(quarters.map(() => '<i>')),
    [ 'fee burn %' ].concat(quarters.map(() => '<i>')),
    [ 'fees per block' ].concat(quarters.map(() => '<ifee>')),
  ]

  var saveCustomTable = () => {

    var rows = [ 0, 2, 4, 5 ];

    var rowData = rows.map((r) => quarters.map((q, i) => getCell(r, i)));

    customTable.data = rowData.slice(0,3);
    customFeeTable.data = rowData.slice(3,)

    var data = {
      customTable: customTable,
      customFeeTable: customFeeTable,
    }

    let queryParams = new URLSearchParams(window.location.search);
    queryParams.set('custom-table', JSON.stringify(data));
    history.replaceState(null, null, "?" + queryParams.toString());
  }

  var loadCustomTable = () => {
    var queryParams = new URLSearchParams(window.location.search);
    var data = queryParams.get('custom-table');
    if (data != null) {
      var data = JSON.parse(data);
      customTable = data.customTable;
      customFeeTable = data.customFeeTable;
    }
    if (customTable.checked) {
      checkLast(document.querySelectorAll('input[name="schedule"]'));
    }
    if (customFeeTable.checked) {
      checkLast(document.querySelectorAll('input[name="fees"]'));
    }
  }

  var checkLast = (v) => Array.from(v).slice(-1)[0].checked = true;

  var table = document.getElementById('schedule');
  rows.forEach((r) => {
    var tr = document.createElement('tr');
    r.forEach((c) => {
      var th = document.createElement('th');
      if (c == '<i>' || c == '<ifee>') {
        var input = document.createElement('input')
        input.onchange = () => {

          ((c) => {
            if (c == '<ifee>') {
              checkLast(document.querySelectorAll('input[name="fees"]'));
              customFeeTable.checked = true;
            } else {
              checkLast(document.querySelectorAll('input[name="schedule"]'));
              customTable.checked = true;
            }
          })(c);

          saveCustomTable();

          if (e.onchange != null) {
            e.onchange();
          }
        }
        th.appendChild(input);
      } else {
        th.innerText = c;
      }
      tr.appendChild(th);
    });
    table.appendChild(tr);
  });

  var setCell = (r, c, v) => table.children[r+1].children[c+1].children[0].value = v;
  var getCell = (r, c) => table.children[r+1].children[c+1].children[0].value;

  var clamp = (x, min, max) => Math.min(Math.max(x, min), max);

  loadCustomTable();

  updateTable();

  return {
    month2blockReward: (m) => {
      return parseFloat(getCell(0, Math.floor(m/3)));
    },
    month2superchargedReward: (m) => {
      var v = getCell(2, Math.floor(m/3));
      return v == '' ? undefined : parseFloat(v);
    },
    month2fees: (m) => {
      return parseFloat(getCell(5, Math.floor(m/3)));
    },
    month2feeBurn: (m) => {
      return parseFloat(getCell(4, Math.floor(m/3)))/100;
    },
    fillYields: (blockRewardYields, superchargedYields) => {
      quarters.forEach((q, i) => {
        setCell(1, i, round3(blockRewardYields[q])*100);
        if (!isNaN(superchargedYields[q])) {
          setCell(3, i, round3(superchargedYields[q])*100);
        }
      });
    },
    onchange: (fn) => {
      e.onchange = fn;
    }
  }
}
