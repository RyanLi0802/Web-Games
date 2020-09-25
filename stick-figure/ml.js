(function() {
    "use strict";
    const net = new brain.NeuralNetwork({
        activation: 'sigmoid', // activation function
        hiddenLayers: [20],
        iterations: 20000,
        // learningRate: 0.5 // global learning rate, useful when training using streams
    });

    let timer = setInterval(trainNet, 1000);

    function trainNet() {
        if (endGame) {
            clearInterval(timer);
            net.train(data);

            let json = net.toJSON();
            download(JSON.stringify(json), 'net.js', 'text/javascript');
        }
    }

    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
  })();