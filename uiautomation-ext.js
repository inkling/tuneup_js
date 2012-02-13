#import "assertions.js"
#import "lang-ext.js"

extend(UIATableView.prototype, {
  /**
   * A shortcut for:
   *  this.cells().firstWithName(name)
   */
  cellNamed: function(name) {
    return this.cells().firstWithName(name);
  },

  /**
   * Asserts that this table has a cell with the name (accessibility label)
   * matching the given +name+ argument.
   */
  assertCellNamed: function(name) {
    assertNotNull(this.cellNamed(name), "No table cell found named '" + name + "'");
  }
});

extend(UIAElement.prototype, {
	// Poll till the item becomes visible, up to a specified timeout
	waitUntilVisible: function (timeoutInSeconds)
	{
		timeoutInSeconds = timeoutInSeconds == null ? 5 : timeoutInSeconds;
		var element = this;
		var delay = 0.25;
		retry(function() { 
			if(!element.isVisible()) {
				throw("Element (" +  element + ") didn't become visible within " + timeoutInSeconds + " seconds.");
			}
		}, timeoutInSeconds/delay, delay);
	},

	/*
		Wait until element becomes invisible
	*/	
	waitUntilInvisible: function (timeoutInSeconds)
	{
		timeoutInSeconds = timeoutInSeconds == null ? 5 : timeoutInSeconds;
		var element = this;
		var delay = 0.25;
		retry(function() { 
			if(element.isVisible()) {
				throw("Element (" +  element + ") didn't become invisible within " + timeoutInSeconds + " seconds.");
			}
		}, timeoutInSeconds/delay, delay);
	},
	
	/**
   * A shortcut for waiting an element to become visible and tap.
   */
  vtap: function() {
    this.waitUntilVisible(10);
    this.tap();
  },
  /**
   * A shortcut for touching an element and waiting for it to disappear.
   */
  tapAndWaitForInvalid: function() {
    this.tap();
    this.waitForInvalid();
  }
});

extend(UIAApplication.prototype, {
  /**
   * A shortcut for getting the current view controller's title from the
   * navigation bar. If there is no navigation bar, this method returns null
   */
  navigationTitle: function() {
    navBar = this.mainWindow().navigationBar();
    if (navBar) {
      return navBar.name();
    }
    return null;
  },

  /**
   * A shortcut for checking that the interface orientation in either
   * portrait mode
   */
   isPortraitOrientation: function() {
     var orientation = this.interfaceOrientation();
     return orientation == UIA_DEVICE_ORIENTATION_PORTRAIT ||
       orientation == UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN;
   },

  /**
   * A shortcut for checking that the interface orientation in one of the
   * landscape orientations.
   */
   isLandscapeOrientation: function() {
     var orientation = this.interfaceOrientation();
     return orientation == UIA_DEVICE_ORIENTATION_LANDSCAPELEFT ||
       orientation == UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT;
   }
});

extend(UIANavigationBar.prototype, {
  /**
   * Asserts that the left button's name matches the given +name+ argument
   */
  assertLeftButtonNamed: function(name) {
    assertEquals(name, this.leftButton().name());
  },
  
  /**
   * Asserts that the right button's name matches the given +name+ argument
   */
  assertRightButtonNamed: function(name) {
    assertEquals(name, this.rightButton().name());
  }
});

extend(UIATarget.prototype, {
  /**
   * A shortcut for checking that the interface orientation in either
   * portrait mode
   */
   isPortraitOrientation: function() {
     var orientation = this.deviceOrientation();
     return orientation == UIA_DEVICE_ORIENTATION_PORTRAIT ||
       orientation == UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN;
   },

  /**
   * A shortcut for checking that the interface orientation in one of the
   * landscape orientations.
   */
   isLandscapeOrientation: function() {
     var orientation = this.deviceOrientation();
     return orientation == UIA_DEVICE_ORIENTATION_LANDSCAPELEFT ||
       orientation == UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT;
   },

   /**
    * A convenience method for detecting that you're running on an iPad
    */
    isDeviceiPad: function() {
      return this.model().match(/^iPad/) !== null;
    },

    /**
     * A convenience method for detecting that you're running on an
     * iPhone or iPod touch
     */
    isDeviceiPhone: function() {
      return this.model().match(/^iPhone/) !== null;
    }
});


/// *** S9AKeyboard

extend(UIAKeyboard.prototype,{
	KEYBOARD_TYPE_UNKNOWN :-1,
	KEYBOARD_TYPE_ALPHA : 0,
	KEYBOARD_TYPE_ALPHA_CAPS : 1,
	KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION:2,
	KEYBOARD_TYPE_NUMBER:3,
	keyboardType : function() {
		if (this.keys().length < 12){
            return this.KEYBOARD_TYPE_NUMBER;
		}
        else if (this.keys().firstWithName("a").toString() != "[object UIAElementNil]")
            return this.KEYBOARD_TYPE_ALPHA;
        else if (this.keys().firstWithName("A").toString() != "[object UIAElementNil]")
            return this.KEYBOARD_TYPE_ALPHA_CAPS;
        else if (this.keys().firstWithName("1").toString() != "[object UIAElementNil]")
            return this.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION;
        else
            return this.KEYBOARD_TYPE_UNKNOWN;
    },
	
	/**
	 * A convenience method for tapping a key.
	 *
	 * This method does nothing if the keyboard does not have a key
	 * with the specified label.
	 *
	 * This method delays slightly before returning
	 * to ensure that chained keypresses register.
	 *
	 * @param {String} keyLabel The string label of a key.
	 */
	 keyPress: function(keyLabel) {
		var key = this.buttons()[keyLabel];
		if (key.isValid()) {
			key.tap();
			UIATarget.localTarget().delay(0.5);
		}
	 },
	
	/**
	 * A wrapper around typeString which feeds the characters to be typed 
	 * to typeString one-by-one.
	 *
	 * When typeString is directly invoked with a string of length > 1,
	 * Instruments throws a "tap point is required" error after the first character 
	 * is typed. Typing the characters one-by-one is no slower 
	 * and works around the error.
	 *
	 * @param {String} string The string to be typed.
	 */
	s9TypeString: function(string) {
		for (charIndex = 0; charIndex<string.length; charIndex++) {
			this.typeString(string.charAt(charIndex));
		}
	},
	
	/**
	 * A convenience method to tap the "hide" button.
	 */
	hide: function() {
		this.keyPress("Hide keyboard");
	}
});
/**
 *	A convenience accessor for the keyboard.
 *  Note that this method waits for the keyboard to become visible before returning it.
 */
var S9AKeyboard = function() { 
	var kbd = UIATarget.localTarget().frontMostApp().keyboard();
	kbd.waitUntilVisible(3);
	return kbd;
};


/// *** S9ATextField and S9ATextView

/**
 * A wrapper for setValue which dismisses the keyboard afterward.
 *
 * @param {String} value The string that is to be the new value.
 */
var s9SetValue = function(value) {
	this.setValue(value);
	S9AKeyboard().hide();
};

/**
 * Types the specified string into the element character-by-character.
 * (as opposed to simply setting it using s9SetValue).
 *
 * This function causes the element to become first responder, 
 * then invokes UIAKeyboard.s9TypeString.
 * Unlike s9SetValue, this does not hide the keyboard afterward.
 *
 * @param {String} string The string to be typed.
 */
var typeString = function(string) {
	this.tap();							// to become firstResponder
	
	var kbd = UIATarget.localTarget().frontMostApp().keyboard();
	kbd.waitUntilVisible(3);
	kbd.s9TypeString(string);
};

/**
 * Clears this element of text
 */
var clear = function() {
	this.s9SetValue("");
};

extend(UIATextField.prototype,{
	s9SetValue: s9SetValue,
	typeString: typeString,
	clear: clear
});
extend(UIATextView.prototype,{
	s9SetValue: s9SetValue,
	typeString: typeString,
	clear: clear
});
