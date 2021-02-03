define(['qlik'], function(qlik) {
  return {
    definition: {
      type: "items",
      component: "accordion",
      items: {
        dimensions: { uses: "dimensions", min: 0 },
        measures: { uses: "measures", min: 0 },
        sorting: { uses: "sorting" },
        appearance: { uses: "settings" }
      }
    },
    paint: function($element, layout) {
      //console.log(layout.qHyperCube);
      var self = this;
      if( layout.qHyperCube.qDataPages.reduce((r,e)=>r+e.qMatrix.length,0) >=
          layout.qHyperCube.qSize.qcy ) {
        rendering();
        return;
      }
      var width = layout.qHyperCube.qSize.qcx;
      var height = (width==0) ? 1 : Math.floor(10000 / width);
      getAllData(width, height, 0);
      function getAllData(w, h, lr) {
        var requestPage = [{qTop: lr, qLeft: 0, qWidth: w, qHeight: h}];
        self.backendApi.getData(requestPage).then(function(dataPages) {
          var n = dataPages[0].qMatrix.length;
          if(lr + n >= layout.qHyperCube.qSize.qcy) {
            rendering();
            return;
          }
          getAllData(w, h, lr + n);
        });
      }

      function rendering() {
        if(qlik.navigation.getMode()=='edit') {
          //$element.html('Edit Node Now...');
          //return;
        }
        var hc = layout.qHyperCube, allDataPages = hc.qDataPages;
        var table = '<div style="height: 100%; overflow-y: scroll;">';
        table += '<table border="1"><thead><tr>';
        for(let dim of hc.qDimensionInfo)
          table += '<th>' + dim.qFallbackTitle + '</th>';
        for(let mes of hc.qMeasureInfo)
          table += '<th>' + mes.qFallbackTitle + '</th>';
        table += '</tr></thead><tbody>';
        for(let p of allDataPages) {
          for(var r = 0; r < p.qMatrix.length; r++) {
            table += '<tr>';
            for(var c = 0; c < p.qMatrix[r].length; c++) {
              var cell = p.qMatrix[r][c];
              if( cell.qElemNumber == -2 )
                table += '<td>' + '-' + '</td>';
              else if( cell.hasOwnProperty('qText') )
                table += '<td>' + cell.qText + '</td>';
              else if( cell.hasOwnProperty('qNum') )
                table += '<td>' + cell.qNum + '</td>';
              else
                table += '<td>' + '' + '</td>';
            }
            table += '</tr>';
          }
        }
        table += '</tbody></table></div>';
        $element.html(table);
      }
    }
  };
});