class ActionManagerClass {
    constructor() {
      this.pauseProcessing = false;
      this.width = 0;
      this.actions = [];
    }
}

class Action {
    constructor(method, argument) {
      this.method = method;
      this.argument = argument;
    }
}

var ActionManager = new ActionManagerClass();

setInterval(function()
{ 
     if(!ActionManager.pauseProcessing)
     {
        if(ActionManager.actions.length > 0)
        {
            var act = ActionManager.actions.shift();
            act.method(act.argument);
        }
     }
}, 200);