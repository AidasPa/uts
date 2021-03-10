// @ts-nocheck
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MyActor = /** @class */ (function (_super) {
    __extends(MyActor, _super);
    function MyActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyActor.prototype.properties = function () {
        this.hello /*Replicated+EditAnywhere+string*/;
    };
    MyActor.prototype.ctor = function () {
        this.hello = "Hello? Random: " + Math.round(Math.random() * 100);
    };
    MyActor.prototype.receiveBeginPlay = function () {
        _super.prototype.receiveBeginPlay.call(this);
        console.log(this.hello);
    };
    return MyActor;
}(Actor));
require('bootstrap')('index');
