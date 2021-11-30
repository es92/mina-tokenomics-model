

var Schedule = () => {

  var customTable = {
    modelIndex: 3,
    data: null,
  };

  var customFeeTable = {
    modelIndex: 1,
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
    month2blockReward: (m) => [720, 720, 720, 825, 855, 880, 910, 935, 885, 910, 850, 870, 800, 820, 750, 760, 680, 690, 700, 720, 725, 740, 755, 770, 790,].concat(new Array(100).fill(800))[Math.floor(m/3)],
    month2superchargedReward: (m) => [1440, 1440, 1440, 1235, 1070, ].concat(new Array(100).fill(''))[Math.floor(m/3)],
    month2feeBurn: (m) => 0,
  }

  var expand2 = (r) => new Array(r.length*2).fill(null).map((_, i) => r[Math.floor(i/2)]);

  var proposedBRsNoFees = [720].concat(expand2([ 720, 720, 700, 675, 650, 600, 550, 500, 450, 425, 400, 375, 350, 325]), new Array(100).fill(300));

    //[720, 720, 720, 720, 720, 700, 700, 625, 625, 575, 575, 525, 525, 475, 475, 450, 450, 425, 425, 400, 400, 375, 375, 350, 350, 325, 325 ].concat(new Array(100).fill(300));

  var proposedTokenomics2 = {
    month2blockReward: (m) => proposedBRsNoFees[Math.floor(m/3)],
    month2superchargedReward: (m) => [1440, 1440, 1440, 1235, 1070, ].concat(new Array(100).fill(''))[Math.floor(m/3)],
    month2feeBurn: (m) => [0, 0, 0, 0, 0, 0, 0, .1, .1, .1, .1, .2, .2, .2, .2, .4, .4, .4, .6, .6, .6, .6].concat(new Array(100).fill(.8))[Math.floor(m/3)],
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
    'proposed tokenomics (with fee burning)': proposedTokenomics2,
    'custom': makeCustom()
  }

  // ~100m eth, so 1/10,000 of eth sent around in fees each day
  // if ~1b Mina - then grow to 1e5 Mina per day
  // per block, that's 1e5/(24*20*.75), or ~280

  var as_fast_schedule = [].concat(
                            new Array(4).fill(0),
                            new Array(2).fill(20),
                            new Array(2).fill(50),
                            new Array(2).fill(100),
                            new Array(2).fill(150),
                            new Array(4).fill(200),
                            new Array(4).fill(280),
                            new Array(100).fill(280),
                         );

  var feeRadios = {
    'no fees': (m) => 0,
    'fee growth to 1/10,000th of the supply per day (same as Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3/(4/4))],
    'fee growth to 1/10,000th of the supply per day (same as Ethereum today) in 6 years': (m) => as_fast_schedule[Math.floor(m/3/(6/4))],
    'fee growth to 1/10,000th of the supply per day (same as Ethereum today) in 8 years': (m) => as_fast_schedule[Math.floor(m/3/(8/4))],
    'fee growth to 1/5,000th of the supply per day (2x Ethereum today) in 4 years': (m) => as_fast_schedule[Math.floor(m/3/(4/4))]*2,
    'fee growth to 1/5,000th of the supply per day (2x Ethereum today) in 6 years': (m) => as_fast_schedule[Math.floor(m/3/(6/4))]*2,
    'fee growth to 1/5,000th of the supply per day (2x Ethereum today) in 8 years': (m) => as_fast_schedule[Math.floor(m/3/(8/4))]*2,
    'custom': (m) => {
      if (customFeeTable.data != null) {
        return customFeeTable.data[0][Math.floor(m/3)]
      } else {
        return null;
      }
    }
  }

  // file:///Users/evanshapiro/Desktop/gits/mina-inflation-model/index.html

  var updateTable = () => {
    var schedule = document.querySelector('input[name="schedule"]:checked').value;
    var feeSchedule = document.querySelector('input[name="fees"]:checked').value;

    var checkedIndex = (s) => Array.from(document.querySelector(s).parentNode.children).indexOf(document.querySelector(s))/3

    var scheduleIndex = checkedIndex('input[name="schedule"]:checked')
    var feeScheduleIndex = checkedIndex('input[name="fees"]:checked')

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

    customTable.modelIndex = scheduleIndex;
    customFeeTable.modelIndex = feeScheduleIndex;
    saveCustomTable();

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
    
    if (i == customTable.modelIndex) {
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
    
    if (i == customFeeTable.modelIndex) {
      radio.checked = 'checked';
    }
  });

  // ============================================================

  var round3 = (r) => Math.round(r*10e2)/10e2;
  //var round4 = (r) => Math.round(r*10e3)/10e3;

  var quarters = new Array(12*10/3).fill(null).map((_, i) => i*3);

  var rows = [ 
    [ 'month*' ].concat(quarters.map((q, i) => q + 3)),
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
    checkNth(document.querySelectorAll('input[name="schedule"]'), customTable.modelIndex);
    checkNth(document.querySelectorAll('input[name="fees"]'), customFeeTable.modelIndex);
  }

  var checkNth = (v, n) => Array.from(v).slice(n)[0].checked = true;

  var table = document.getElementById('schedule');

  //var tr = document.createElement('tr');
  //var th = document.createElement('th');
  //th.innerText = '6-month start';
  //tr.appendChild(th);
  //quarters.forEach((q, i) => {
  //  var th = document.createElement('th');
  //  var year = q % 12 + 2021
  //  th.innerText = q;
  //  tr.appendChild(th);
  //});
  //table.appendChild(tr);


  rows.forEach((r) => {
    var tr = document.createElement('tr');
    r.forEach((c) => {
      var th = document.createElement('th');
      if (c == '<i>' || c == '<ifee>') {
        var input = document.createElement('input')
        input.onchange = () => {

          ((c) => {
            if (c == '<ifee>') {
              checkNth(document.querySelectorAll('input[name="fees"]'), -1);
              customFeeTable.modelIndex = Object.keys(feeRadios).length-1;
            } else {
              checkNth(document.querySelectorAll('input[name="schedule"]'), -1);
              customTable.modelIndex = Object.keys(radios).length-1;
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
