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


/// *** S9AEditingMenu

// Selectors for various menu items
// i.e. values that can be used to retrieve UIAMenuItems via this.elements()[value]
S9AEditingMenuActionValue = {
	copy : "Copy",
	paste : "Paste",
	selectAll : "Select All",
	define : "Define"
}
extend(UIAEditingMenu.prototype, {
	/**
	 * Taps the menu item identified by actionValue
	 *
	 * @param {String} actionValue The name of the menu item.
	 * @returns {Boolean} true iff actionValue identifies a menu item present in the menu
	 */
	performAction: function(actionValue) {
		var didPerformAction = false;

		// the editing menu may contain multiple items with the same name (one system, one custom), 
		// only one of which is actually visible in the menu (has a non-zero size),
		// so we must search through the array rather than retrieving the item by name
		var menuItem = this.elements().toArray().contains(function(item) {
			return ((item.name() == actionValue) && (item.rect().size.width > 0));
		});
		if (menuItem.isValid()) {
			menuItem.tap();
			didPerformAction = true;
		}
		return didPerformAction;
	}
});
/**
 *	A convenience accessor for the shared editing menu.
 *  Note that this method waits for the menu to become visible before returning it.
 *
 *	@returns {UIAEditingMenu} The editing menu.
 */
var S9AEditingMenu = function() { 
	var em = UIATarget.localTarget().frontMostApp().editingMenu();
	em.waitUntilVisible(3);
	return em;
};


/// *** S9AWebView

// to be extended by tests with reference to appropriate static text selectors
// i.e. values that can be used to retrieve UIAStaticTexts via this.elements()[value]
S9AWebViewSelectionValue = {
}
extend(UIAWebView.prototype, {
	/**
	 * Selects the static text element identified by selectionValue
	 *
	 * @param {String} selectionValue The value of the static text element to be selected.
	 * @returns {Boolean} true iff selectionValue identified a valid static text element
	 */
	select: function(selectionValue) {
		var didSelect = false;
		
		var text = this.elements()[selectionValue];
		if (text.isValid()) {
			text.touchAndHold(1);		
			didSelect = true;
		}
		return didSelect;
	},
	
	/**
	 * Dismisses any selection by tapping on the first static text element in the webview
	 * (Tapping on the webview itself sometimes causes the webview to jump to the end of the page.)
	 */
	dismissSelection: function() {
		this.staticTexts()[0].tap();
		UIATarget.localTarget().delay(1);
	},

	/**
	 * Selects the static text element identified by selectionValue
	 * then invokes the "copy" action from the editing menu
	 *
	 * @param {String} selectionValue The value of the static text element to be copied.
	 * @returns {Boolean} true iff selectionValue identified a valid static text element
	 *			and "copy" could be invoked on the selection
	 */
	copy: function(selectionValue) {
		var didCopy = false;
		
		if (this.select(selectionValue)) {
			didCopy = S9AEditingMenu().performAction(S9AEditingMenuActionValue.copy);
		}
		return didCopy;
	},
	
	/**
	 * Selects the static text element identified by selectionValue
	 * then invokes the "define" action from the editing menu
	 *
	 * @param {String} selectionValue The value of the static text element to be defined.
	 * @returns true iff selectionValue identified a valid static text element
	 *			and "define" could be invoked on the selection
	 */
	define: function(selectionValue) {
		var didDefine = false;
		
		if (this.select(selectionValue)) {
			didDefine = S9AEditingMenu().performAction(S9AEditingMenuActionValue.define);
		}
		return didDefine;
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
 * Pastes the contents of the clipboard into this element
 */
var paste = function() {
	this.tap();							// to become firstResponder
	UIATarget.localTarget().delay(1);	// the touchAndHold is not registered immediately after the tap
	this.touchAndHold(1);
	
	S9AEditingMenu().performAction(S9AEditingMenuActionValue.paste);
};

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
	paste: paste,
	s9SetValue: s9SetValue,
	typeString: typeString,
	clear: clear
});
extend(UIATextView.prototype,{
	paste: paste,
	s9SetValue: s9SetValue,
	typeString: typeString,
	clear: clear
});


/// *** Miscellaneous Functions

/**
 * 	Given a string representation of a rect, 
 *	returns an object of the same structure 
 *	as is returned by UIAElement.rect()
 *
 *	@param {String} stringRect 	A string representation of a rect
 *								of the format "{{x, y},{width,height}}"
 *								(with arbitrary spacing)
 *	@returns {Rect} A rect initialized from stringRect 
 *					if stringRect is of the expected format,
 *					null otherwise.
 */
function rectFromString(stringRect) {
	var rect = null;

	var rectRegexp = /^\{\s*\{\s*([0-9]+)\s*,\s*([0-9]+)\s*\}\s*,\s*\{\s*([0-9]+)\s*,\s*([0-9]+)\s*\}\s*\}$/;
	var rectMatch = rectRegexp.exec(stringRect);
	if (rectMatch) {
		rect = {origin:{},size:{}};
		rect.origin.x = rectMatch[1];
		rect.origin.y = rectMatch[2];
		rect.size.width = rectMatch[3];
		rect.size.height = rectMatch[4];
	}

	return rect;
}

/**
 *	Given a rect object (e.g. from UIAElement.rect()), 
 *	returns its string representation
 *
 *	@param {Rect} rect A rect.
 *	@returns {String}	The string representation of rect,
 *						of the format "{{x, y},{width,height}}"
 */
function stringFromRect(rect) {
	var stringRect = 
	"{{" + rect.origin.x + "," + rect.origin.y + "}" + "," 
	+ "{" + rect.size.width + "," + rect.size.height + "}}";
	return stringRect;
}
