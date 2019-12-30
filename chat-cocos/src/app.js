
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    nameData:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        nameData = "Anonymous";
        this._super();

        var size = cc.winSize;

        var textField = new ccui.TextField("Chat here", "Marker Felt", 20);
        textField.x = size.width / 2;
        textField.y = size.height / 9;
        textField.setColor(cc.color(255, 255, 0, 255));
        textField.addEventListener(this.textFieldEvent, this);

        this.addChild(textField);
        var nameField = new ccui.TextField("Enter your name", "Marker Felt", 20);
        nameField.x = size.width / 2;
        nameField.y = size.height / 15;
        nameField.setColor(cc.color(255, 255, 0, 255));
        nameField.addEventListener(this.nameFieldEvent, this);

        this.addChild(nameField);
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);
        scrollView.setContentSize(cc.size(800, 390));

        scrollView.x = 0;
        scrollView.y = 60;
        this.addChild(scrollView);

        var innerWidth = 800;
        var innerHeight = 1000;

        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        var ws = new WebSocket("ws://127.0.0.1:1337");
        var i = 0;

        ws.onmessage = function (message) {
            try {
                var json = JSON.parse(message.data);
            } catch (e) {
                console.log('Invalid JSON: ', message.data);
                return;
            }
            if (json.type === 'history') {
                for (i = 0; i < json.data.length; i++) {
                    var text = new ccui.Text(json.data[i].name+": "+json.data[i].text, "AmericanTypewriter", 18);
                    text.setPosition(cc.p(size.width/2, 950 - 23*i));
                    text.setColor(cc.color(255, 155, 77));
                    scrollView.addChild(text);
                }
            } else if (json.type === 'message') {
                var newText = new ccui.Text(json.data.name + ": " +json.data.text, "AmericanTypewriter", 18);
                newText.setPosition(cc.p(size.width/2, 950 - 23 *i));
                newText.setColor(cc.color(255, 155, 77));
                scrollView.addChild(newText);
                i++;
            } else {
                console.log('Hmm..., I\'ve never seen JSON like this:', json);
            }
        };

        ws.onclose = function () {
            alert("Connection is closed...");
        };

        return true;
    },
    textFieldEvent: function (textField, type) {
        switch (type) {
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                var ws = new WebSocket("ws://127.0.0.1:1337");

                if(textField.string != "") {
                    var data = textField.string;
                    var obj = {
                        name: nameData,
                        text: data
                    };
                    textField.string = "";
                    var json = JSON.stringify(obj);
                    ws.onopen = function () {
                        ws.send(json);
                    };
                }
                break;
        }
    },
    nameFieldEvent: function (nameField, type) {
        switch (type) {
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                nameData = nameField.string;
                break;
        }
    }

});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});
