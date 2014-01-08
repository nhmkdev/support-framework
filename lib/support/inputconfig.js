/*
 Input Config is an input processor to allow the user to map inputs. This is used by the Input Config Menu.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.inputconfig'
)
.requires(
	'impact.game',
	'support.util'
    //'plugins.touch-button'
)
.defines(function(){

// ImpactJS Note: Several buttons can be bound to the same action, but a button can not be bound to several actions.
// NOTE: be sure cancel_inputconfig is defined on some button! (recommend escape)

        //TODO: document data format!

var Support = ig.global.support;
var Util = Support.util;

function InputConfig(){}

InputConfig.LISTEN_RESULT =
{
    NOTHING:0,
    SUCCESS:1,
    ALREADY_BOUND:2,
    CANCEL:3
};


/*
 Constructor for input config
 @param (object) constBinding - The constant binding (default)
 @param {object} currentBinding - The current binding
 */
InputConfig.prototype.init = function(constBinding, currentBinding)
{
	this.constBinding = constBinding;
	this.constBindingUsedKeys = [];
    this.currentBindingUsedKeys = [];
	this.currentBinding = {};
	this.backupBinding = {};
	
	if(this.constBinding == null)
	{
		this.constBinding = {};
	}
	
	this.duplicateBinding(currentBinding, this.currentBinding);
	this.duplicateBinding(this.currentBinding, this.backupBinding);
	
	// cache an array of all the const bindigs
	for (actionName in this.constBinding)
	{
		this.constBindingUsedKeys.push(this.constBinding[actionName]);
	}	
}

/*
 Updates the collection of all used keys (keys assigned to actions)
 */
InputConfig.prototype.updateUsedKeys = function()
{
    this.currentBindingUsedKeys = [];
	// cache an array of all the current bindigs
	for (actionName in this.currentBinding)
	{
		this.currentBindingUsedKeys.push(this.currentBinding[actionName]);
	}    
}

/*
 Assigns all the properties in one object to another
 @param (object) source - source object
 @param {object} destination - destination object
 */
InputConfig.prototype.duplicateBinding = function(source, destination)
{
	for (actionName in source)
	{
        // TODO: hasownproperty check?
		destination[actionName] = source[actionName];
	}	
}
	
// used for user reassigning all inputs
/*
 Starts listening for input to assign to a given action (this completely replaces all input handling to capture the given input)
 @param (string) actionToReplace - The action being assigned to a key
 */
InputConfig.prototype.initializeListen = function(actionToReplace)
{
	this.backupBinding = {};
	this.duplicateBinding(this.currentBinding, this.backupBinding);
	if(actionToReplace == null)
	{
		// reset all bindings
		this.currentBinding = {};
	}
	else
	{
		// keep all bindings except the replaced one
		if(this.currentBinding.hasOwnProperty(actionToReplace))
		{
			delete this.currentBinding[actionToReplace];
		}
	}
    
    this.updateUsedKeys();

	ig.input.unbindAll();
	
	// get and bind all the const bound keys (cancel_inputconfig hopefully!)
	for (actionName in this.constBinding)
	{
		ig.input.bind(this.constBinding[actionName], actionName);
	}
	
	// rebind buttons to themselves by name (skipping const bindings)
	for (keyName in ig.KEY)
	{
		if(this.constBindingUsedKeys.indexOf(ig.KEY[keyName]) == -1)
		{
			ig.input.bind(ig.KEY[keyName], keyName);
		}
	}
}

// TODO: multiple returns? (so it can be indicated the key is special, already used or otherwise)
/*
 Function for listening to input for keys.
 @param (string) newAction - The action to attempt to reassign
 @return {InputConfig.LISTEN_RESULT} A key listen result
 */
InputConfig.prototype.checkForInput = function(newAction)
{	
	for (keyName in ig.KEY)
	{
		if(ig.input.pressed('cancel_inputconfig'))
		{
			//restore the currentBinding to the last good state
			this.currentBinding = {};
			this.duplicateBinding(this.backupBinding, this.currentBinding);
			return InputConfig.LISTEN_RESULT.CANCEL;
		}
		if(ig.input.pressed(keyName))
		{
            var keyValue = ig.KEY[keyName];
			if(this.constBindingUsedKeys.indexOf(keyValue) != -1 ||
			   this.currentBindingUsedKeys.indexOf(keyValue) != -1)
			{
				// cannot assign reserved keys
				// OR key was already bound
				return InputConfig.LISTEN_RESULT.ALREADY_BOUND;
			}
			else
			{
				this.currentBinding[newAction] = ig.KEY[keyName];
				// force update the cache of used key ids
                this.updateUsedKeys();
                return InputConfig.LISTEN_RESULT.SUCCESS;
			}
		}
	}
	return InputConfig.LISTEN_RESULT.NOTHING;
	// TODO: if already defined error or clear?
}

/*
 Loads the specified binding
 @param {object} binding - The key binding object
 @param {bool} unbindAll - Whether to unbind all keys or not (TODO: when would this NOT be true?)
 */
InputConfig.loadBinding = function(binding, unbindAll)
{
	if(unbindAll)
	{
		ig.input.unbindAll();
	}
	for (actionName in binding)
	{
		ig.input.bind(binding[actionName], actionName);

	}
}

/*
 Gets the name of a given key based on value
 @param (string) keyValue - The key name to get the value of
 @return {string} The name of the key or 'unknown' if not found in the ig.KEY object
 */
InputConfig.getKeyName = function(keyValue)
{
	for(keyName in ig.KEY)
	{
        // TODO: hasownproperty check?
		if(ig.KEY[keyName] == keyValue)
		{
			return keyName;
		}
	}
	return 'unknown';
}

Support.inputConfig = new InputConfig();
// add the static methods / data (TODO: is this bad practice?)
Support.inputConfig.loadBinding = InputConfig.loadBinding;
Support.inputConfig.getKeyName = InputConfig.getKeyName;
Support.inputConfig.LISTEN_RESULT = InputConfig.LISTEN_RESULT;

});