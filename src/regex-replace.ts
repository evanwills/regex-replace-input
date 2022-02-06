/** Globals Error */
import { html, css, LitElement, TemplateResult, } from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import { TResult, TRegexPair } from './vite-env';

@customElement('regex-replace')
export class RegexReplace extends LitElement {
  /**
   * Predefined RegExp string
   *
   * @var pattern
   */
  @property({ reflect: true, type: String })
  pattern : string = '';
  /**
   * Predefined RegExp string
   *
   * @var pattern
   */
  @property({ reflect: true, type: String })
  replace : string = '';

  /**
   * Predefined RegExp flags
   *
   * @var flags
   */
  @property({ reflect: true, type: String })
  flags : string = 'ig';

  /**
   * How to handle flags/modifiers
   * * 'show' (default) Show flags and make them editable
   * * 'disable' Show the flags but don't allow them to be edited
   * * 'hide' Don't show the flags at all
   *
   * @var flagState
   */
  @property({ type: String })
  flagState : string = 'show';

  /**
   * Error generated by an invalid regular expression
   *
   * @var regexError
   */
  @property({ reflect: true, type: String })
  regexError : string = '';

  /**
   * RegExp Flags allowed by the client
   *
   * @var maxlength
   */
  @property({ type: String })
  allowedFlags : string = '';

  /**
   * The maximum number of characters a regular expression is
   * allowed to be
   *
   * @var maxlength
   */
  @property({ type: Number })
  maxlength : number = 512;

  /**
   * ID of the label field used to label the regex input
   *
   * @var labelID
   */
  @property({ type: String })
  labelID : string = '';

  /**
   * Regex engine is not ECMAscript (e.g. used for PHP PCRE or .Net)
   *
   * This stops the allowedFlags from being validated against normal
   * ECMAscript flags
   *
   * @var notJs
   */
  @property({ type: Boolean })
  notJs : boolean = false;

  /**
   * Don't show regex delimiters
   *
   * @var noDelims
   */
  @property({ type: Boolean })
  noDelims : boolean = false;

  /**
   * Regular expression delimiter (for non-JS regex engines)
   *
   * @var delim
   */
  @property({ type: String })
  delim : string = '/';

  /**
   * Some regex engines allow paird delimiters (e.g. "<" & ">")
   *
   * If your regex engine allows paird delimiters, set this to true
   *
   * @param pairedDelim
   */
  @property({ type: Boolean })
  pairedDelim : boolean = false;

  /**
   * Show input field labels
   *
   * @param showLabels
   */
  @property({ type: Boolean })
  showLabels : boolean = false;

  /**
   * Disable user interaction with input fields
   *
   * @param disabled
   */
  @property({ type: Boolean })
  disabled : boolean = false;

  /**
   * Allow invalid regexes to trigger change events.
   *
   * By default, invalid regex patterns will not trigger a change
   * event on the parent. If using an external regex engine,
   * sometimes things that are invalid for ECMAscript RegExp will
   * be valid in that engine. This will cause all changes to the
   * pattern to trigger a change event.
   *
   * @param allowInvalid
   */
  @property({ type: Boolean })
  allowInvalid : boolean = false;

  /**
   * Whether or not to render sample test UI
   *
   * @var _showTestUI
   */
  @state()
  public testSample : string = '';

  /**
   * Whether or not to split the sample before processing
   *
   * @var splitSample
   */
  @state()
  public splitSample : boolean = false;

  /**
   * Whether or not to trim the sample(s) before processing
   *
   * @var trimSample
   */
  @state()
  public trimSample : boolean = false;

  /**
   * Does the regex have any errors
   *
   * @var hasError
   */
  @state()
  public hasError : boolean = false;

  /**
   * Whole regex string including delimiters & flags
   *
   * @var wholeRegex
   */
  @state()
  public wholeRegex : string = '';

  /**
   * Two dimenstional array
   *
   * @var results
   */
  @state()
  public results : Array<TResult> = [];

  /**
   * Opening delimiter character
   *
   * (only relevant when used for non JS regex engines)
   *
   * @var _delimOpen
   */
  @state()
  private _delimOpen : string = '/';

  /**
   * Closing delimiter character
   *
   * (only relevant when used for non JS regex engines)
   *
   * @var _delimOpen
   */
  @state()
  private _delimClose : string = '/';

  /**
   * Number REMs wide the regex input field should be
   *
   * @var _regexSize
   */
  @state()
  private _regexSize : number = 1.25;

  /**
   * Number REMs wide the replace input field should be
   *
   * @var _replaceSize
   */
  @state()
  private _replaceSize : number = 1.25;

  /**
   * The number of REMs wide the flags input field should be
   *
   * @var _flagSize
   */
  @state()
  private _flagSize : number = 1.4;

  /**
   * List of allowed regex flags
   *
   * @var _alloweFlags
   */
  @state()
  private _alloweFlags : Array<string> = ['i', 'g', 'd', 'm', 's', 'u', 'y'];

  /**
   * Default placeholder text for flags input
   *
   * @var _placeFlag
   */
  @state()
  private _placeFlag : string = 'i'

  /**
   * List of custom regex flags (if set by the client)
   *
   * @var _customAllowedFlags
   */
  @state()
  private _customAllowedFlags : Array<string> = this._alloweFlags


  /**
   * List of errors generated by invalid or duplicate flag characters
   *
   * @var _flagErrors
   */
  @state()
  private _flagErrors : Array<string> = [];

  /**
   * Whether or not initialisation of functions and values is
   * alrady done
   *
   * @var _initDone
   */
  @state()
  private _initDone : boolean = false;

  /**
   * Whether or not to render sample test UI
   *
   * @var _showTestUI
   */
  @state()
  private _showTestUI : boolean = false;


  /**
   * Whether or not to trim the sample(s) before processing
   *
   * @var _showResults
   */
   @state()
   private _showResults : boolean = false;


   /**
    * Whether or not to trim the sample(s) before processing
    *
    * @var _showWhiteSpace
    */
    @state()
    private _showWhiteSpace : boolean = false;



  static styles = css`
    :host {
      --ri-border-radius: var(0.9rem);

      --wc-font-size: 1rem;
      --wc-border-radius: var(--border-radius, var(--ri-border-radius));
      --wc-text-colour: var(--txt-colour, rgb(255, 255, 255));
      --wc-bg-colour: var(--bg-colour, rgb(0, 85, 34));
      --wc-error-bg-colour: var(--error-bg-colour, rgb(150, 0, 0));
      --wc-error-text-colour: var(--error-text-colour, rgb(255, 255, 255));
      --wc-line-width: 0.075rem;
      --wc-max-width: 30rem;
      --wc-default-input-font: 'Courier New', Courier, monospace;
      --wc-input-font: var(--default-input-font, var(--wc-default-input-font));
      --wc-outline-width: 0.25rem;
      --wc-outline-style: dotted;
      --wc-outline-offset: 0.2rem;

      font-size: var(--wc-font-size);
      background-color: var(--wc-bg-colour, inherit);
      color:  var(--wc-text-colour, inherit);
      font-family: inherit;
      font-size: inherit;
    }
    .sr-only {
      border: 0;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(100%);
      height: 1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
    .whole {
      display: block;
    }
    .wrap {
      backgroud-color: var(--wc-bg-colour);
      color: var(--wc-text-colour);
      border: var(--wc-line-width, 0.05rem) solid var(--wc-text-colour, #ccc);
      border-radius: var(--wc-border-radius);
      display: inline-flex;
      font-size: 1.1rem;
      font-weight: bold;
      overflow: hidden;
      padding: 0.2rem 0.5rem;
    }
    .wrap.testing {
      padding-right: 0.2rem;
    }
    .wrap:focus-within {
      outline-width: var(--wc-outline-width);
      outline-style: var(--wc-outline-style);
      outline-color: var(--wc-text-colour);
      outline-offset: var(--wc-outline-offset);
    }
    .wrap > span {
      font-family: var(--wc-input-font);
    }
    input {
      background-color: var(--wc-bg-colour);
      border: none;
      color: var(--wc-text-colour);
      display: inline-block;
      font-family: var(--wc-input-font);
      font-size: 1.1rem;
      text-align: center;
      transition: width ease-in-out 0.2s;
      max-width: var(--wc-max-width);
      padding: 0;
    }
    .regex-flags {
      width: 4rem;
    }
    .errors {
      margin: -0.5rem 0 0.5rem;
      padding: 0.5rem;
      color: var(--wc-error-text-colour);
      background-color: var(--wc-error-bg-colour);
      border: var(--wc-line-width) solid var(--wc-error-text-colour);
      border-radius: var(--wc-border-radius);
    }
    .errors ul {
      margin: 0;
      padding: 0;
    }
    .errors li {
      margin: 0.5rem 0 0 1rem;
      padding: 0 0 0 0;
    }
    .errors li:first-child {
      margin-top: 0;
    }
    button {
      background-color: var(--wc-text-colour);
      border: none;
      border-radius: var(--wc-border-radius);
      color: var(--wc-bg-colour);
      display: inline-block;
      margin-left: 1rem;
      padding: 0.05rem 0.5rem;
      text-transform: uppercase;
    }
    button:hover {
      cursor: pointer;
    }
    .expanded {
      transform: scale(1);
      transform-origin: center;
      transition: scale ease-in-out 0.3s;
    }
    .expanded.collapsed {
      transform: scale(0);
    }
    .close-bg {
      background-color: #000;
      bottom: -2rem;
      left: -2rem;
      opacity: 0.7;
      position: fixed;
      right: -2rem;
      top: -2rem;
      width: 150%;
      z-index: 100;
    }
    .close {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
    }
    .test-ui {
      background-color: var(--wc-bg-colour);
      box-shadow: 0.5rem 0.5rem 1.5rem rgba(0, 0, 0, 0.8);
      border: var(--wc-line-width) solid var(--wc-text-colour);
      bottom: 4rem;
      display: flex;
      left: 4rem;
      // min-height: 30rem;
      padding: 1rem;
      position: fixed;
      right: 4rem;
      top: 4rem;
      z-index: 110;
    }
    .test-ui-inner {
      flex-grow: 1;
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      grid-template-rows: auto auto auto 1fr;
      grid-template-areas:
        "errors errors"
        "regex regex"
        "sample controls"
        "sample results";
      grid-gap: 1rem;
    }
    .error-block {
      grid-area: errors;
      height: 0;
      padding-top: 0;
    }
    .error-block.has-errors {
      height: auto;
      padding-top: 0.75rem;
    }
    .regex {
      grid-area: regex;
      height: 1.5rem;
    }
    textarea {
      grid-area: sample;
    }
    .controls {
      grid-area: controls;
      display: grid;
      grid-template-columns: auto;
      grid-template-areas: 'test-btn'
                           'split-box'
                           'trim-box';
    }
    .test-btn {
      display: block;
      margin: 0 0 0.5rem;
      width: 100%;
      grid-area: test-btn;
    }
    .controls > label {
      display: block;
      margin: 0 0 0.5rem;
      padding-left: 1.35rem;
      text-indent: -1.6rem;
    }
    .test-results {
      grid-area: results;
      overflow-y: auto;
    }
    .bar {
      margin: -0.2rem .6rem -0.2rem .8rem;
      border-left: var(--wc-line-width) solid var(--wc-text-colour);
    }
    .regex .regex-pattern {
      max-width: auto;
    }
    .match-result p {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }
    .match-result code {
      font-size: 1.25rem;
    }
    .multi-match {
      margin: 0;
      padding: 0;
    }
    .multi-match > li {
      list-style-type: none;
      padding: 0.5rem 0 0 0;
      border-top: var(--wc-line-width) dotted var(--wc-text-colour);
      margin-bottom: 0.5rem;
    }
    .multi-match > li:first-child {
      border-top: none;
      padding-top: none;
    }
    @media screen and (min-width: 52rem) {
      .controls {
        width: 100%;
        grid-template-areas: 'test-btn test-btn'
                             'split-box trim-box';
      }
      .split-checkbox {
        grid-area: split-box;
      }
      .trim-checkbox {
        grid-area: trim-box;
      }
    }
    @media screen and (min-width: 60rem) {
      .controls {
        width: 100%;
        grid-template-areas: 'test-btn split-box trim-box';
      }
      .split-checkbox {
        padding-left: 3rem !important;
      }
    }
  `;

  //  END:  Property declarations
  // --------------------------------------------
  // START: Private helper methods

  /**
   * Do all the work to initialise everything
   *
   * @returns {void}
   */
  _doInit () {
    if (this._initDone === false) {
      this._initDone = true;
      if (this.allowedFlags !== '') {
        const tmp = (this.notJs === false)
          ? this._cleanFlags(this.allowedFlags)
          : this.allowedFlags;
        const c = this._flagErrors.length

        if (c > 0) {
          for (let a = 0; a < c; a += 1) {
            // Log this to console to let the dev know they've
            // stuffed up
            console.error(this._flagErrors[a]);
          }
          // reset flag errors because these errros are only relevant
          // to the developer
          this._flagErrors = [];
        } else if (tmp.length > 0) {
          this.allowedFlags = tmp;
          this._customAllowedFlags = Array.from(tmp);
        }
      }
      // make sure the incoming flags are OK
      this.flags = this._cleanFlags(this.flags);

      let b = 0;
      this._placeFlag = '';
      for (let a = 0; a < this._customAllowedFlags.length; a += 1) {
        this._placeFlag += this._customAllowedFlags[a];
        b += 1;
        if (b >= 2) {
          break;
        }
      }
      this._flagSize = (this.flags !== '')
        ? this._getSize(this.flags, true)
        : this._getSize(this._placeFlag, true);

      this.flagState = this.flagState.toLowerCase();
      switch (this.flagState) {
        case 'hide':
        case 'show':
          break;
        case 'disable':
        case 'disabled':
          this.flagState = 'disabled';
          break;
        default:
          console.warn(`"${this.flagState}" is invalid. Defaulting to "show"`)
          this.flagState = 'show';
      }

      if (this.pattern !== '') {
        // Test the incoming regex
        this._regexSize = this._getSize(this.pattern, false);
        this._regexIsValid(this.pattern, this.flags);
      }

      this.allowInvalid = (this.notJs && this.allowInvalid)

      if (this.notJs === true && this.delim !== '' && this.delim !== '/') {
        const tmp = this.delim.trim().substring(0, 1);

        if (/^[\\a-z0-9 ]$/.test(tmp)) {
          console.error(`"${tmp}" is not a valid delimiter`)
        } else {
          if (this.pairedDelim === true) {
            switch (tmp) {
              case '{':
              case '}':
                this._delimOpen = '{';
                this._delimOpen = '}';
                break;

              case '(':
              case ')':
                this._delimOpen = '(';
                this._delimOpen = ')';
                break;

              case '[':
              case ']':
                this._delimOpen = '[';
                this._delimOpen = ']';
                break;

              case '<':
              case '>':
                this._delimOpen = '<';
                this._delimOpen = '>';
                break;

              default:
                this._delimOpen = tmp;
                this._delimClose = tmp;
            }
          } else {
            this._delimOpen = tmp;
            this._delimClose = tmp;
          }
        }
      } else {
        this.delim = '/';
        this._delimOpen = '/';
        this._delimClose = '/';
      }
    }
    this._setWholeRegex()
  }

  /**
   * Strip invalid flags and remove duplicate flags
   *
   * @param input Flags string
   *
   * @returns String without duplicate or invalid flags
   */
  _cleanFlags (input : string) : string {
    const tmp1 : Array<string> = Array.from(input)
    let tmp2 : Array<string> = [];
    let output : string = '';
    const errors : Array<string> = [];

    for (let a = 0; a < tmp1.length; a += 1) {
      if (this._customAllowedFlags.indexOf(tmp1[a]) > -1) {
        if (tmp2.indexOf(tmp1[a]) === -1) {
          tmp2.push(tmp1[a])
        } else {
          errors.push(`"${tmp1[a]}" was already listed so was removed`)
        }
      } else {
        errors.push(`"${tmp1[a]}" is not a valid flag so was removed`)
      }
    }

    this._flagErrors = errors;

    for (let a = 0; a < tmp2.length; a += 1) {
      output += tmp2[a];
    }
    return output;
  }

  /**
   * Get the length the input field should be (in REMs)
   *
   * @param str   The string defining the length of the input
   * @param flags Minimum value for output
   *
   * @returns Number of REMs wide the input field should be
   */
  _getSize (str : string, flags : boolean = false) : number {
    const tmp : number = this._chars2rems(str.length);

    if (str === '' && flags === true) {
      const _tmp : number = this._placeFlag.length
      return this._chars2rems((_tmp > 0) ? _tmp : 1);
    }

    if (tmp < 1) {
      return 1;
    } else {
      return tmp;
    }
  }

  /**
   * Build the full regex string including delimiters
   */
  _setWholeRegex () : void {
    this.wholeRegex = this._delimOpen + this.pattern +
                      this._delimClose + this.flags;
  }

  /**
   * Check whether the regex & flags are valid
   *
   * @param regexStr RegExp string
   * @param flagsStr Regexp modifier flags string
   *
   * @returns TRUE if regex is valid. FALSE otherwise
   */
  _regexIsValid (regexStr : string, flagsStr : string) : boolean {
    let regex : RegExp;

    try {
      regex = new RegExp(regexStr, flagsStr)
    } catch (e : any) {
      // Regex has an error lets deal with that

      this.hasError = true;
      this.regexError = this._ucFirst(e.message);

      // If this is not for ECMAscript RegExp and client wants to
      // allow invalid regexes then we'll give them what they want
      // This will allow change event to be triggered allowInvalid
      // is true
      return this.allowInvalid;
      console.error(regex);
    }
    // this.hasError = false;
    // this.regexError = '';

    // All good
    return true;
  }

  /**
   * Make first alphabetical character in a string uppercase
   *
   * @param input string to be modified
   *
   * @returns modified string
   */
  _ucFirst (input : string) : string {
    return input.replace(
      /^([^a-z]*)([a-z])/ig,
      (whole, first, char) => {
        return first + char.toUpperCase();
        console.log(whole);
      }
    )
  }

  _chars2rems (input: number) : number {
    return Math.round((input * 0.675) * 100) / 100;
  }

  _escape (input : string) : string {
    return input.replace(/"/g, '&#34;')
  }

  _eventGetter(event : Event) : HTMLInputElement {
    event.preventDefault()
    return event.target as HTMLInputElement;
  }

  _getValue (event : Event) : string {
    const input = this._eventGetter(event);
    return input.value;
  }

  _getIsChecked (event : Event) : boolean {
    const input = this._eventGetter(event);
    return input.checked;
  }

  /**
   * Apply regex to sample(s) and store the result
   *
   * @returns {void}
   */
  _getTestResults () : void {
    // console.group('_getTestResults()')
    // console.log('this.regexError:', this.regexError)
    // console.log('this.pattern:', this.pattern)
    // console.log('this.replace:', this.replace)
    // console.log('this.flags:', this.flags)
    // console.log('this.testSample:', this.testSample)

    const regex = new RegExp(this.pattern, this.flags);

    this.results = []

    if (this.regexError === '') {
      const samples = (this.splitSample)
        ? this.testSample.split("\n")
        : [this.testSample];

      if (this.trimSample) {
        for (let a = 0; a < samples.length; a += 1) {
          samples[a] = samples[a].trim();
        }
      };
      for (let a = 0; a < samples.length; a += 1) {
        const matches  = samples[a].match(regex);
        const tmp = samples[a].replace(regex, this.replace)

        this.results.push({
          sample: samples[a],
          matches: (matches !== null)
            ? matches
            : [],
          output: (this._showWhiteSpace)
            ? this._renderWhiteSpace(tmp)
            : tmp
        });
      }
    }
    // console.log('this.results:', this.results)
    // console.groupEnd();
  }

  _renderWhiteSpace (input : string) : string {
    const pairs : Array<TRegexPair> = [
      {
        find: /\t/g,
        replace: '[TAB]'
      },
      {
        find: / /g,
        replace: '[SPACE]'
      },
      {
        find: /\n/g,
        replace: '[NEW LINE]'
      },
      {
        find: /\r/g,
        replace: '[RETURN]'
      }
    ];
    let output : string = input;
    for (let a = 0; a < pairs.length; a += 1) {
      output = output.replace(pairs[a].find, pairs[a].replace);
    }

    return output;
  }

  //  END:  Private helper methods
  // --------------------------------------------
  // START: Event handler methods

  /**
   * Event handler for regex field key up events
   *
   * (Used for updating the width of the input field)
   *
   * @param event
   */
  regexKeyup (event : Event) : void {
    event.preventDefault()
    const errorMsg = 'Pattern exceded ' + this.maxlength +
                     ' so was truncated.'
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const tmp = raw.substring(0, this.maxlength);

    const size = this._getSize(tmp, false);
    let doUpdate = false;

    if (size !== this._regexSize) {
      this._regexSize = size;
      doUpdate = true;
    }
    if (raw !== tmp) {
      this.regexError = errorMsg;
      input.value = tmp;
      doUpdate = true;
    } else if (this.regexError ===  errorMsg) {
      this.regexError = '';
    }

    if (doUpdate) {
      this.requestUpdate();
    }
  }

  /**
   * Event handler function for regex field change events
   *
   * (Used for letting the outside world know the regex has changed
   * and is valid)
   *
   * @param event
   */
  regexChange (event : Event) : void {
    const raw = this._getValue(event);
    const tmp = raw.substring(0, this.maxlength);

    if (tmp !== this.pattern) {
      // We have a new regex string to work with.
      if (tmp !== '') {
        if (!this._regexIsValid(tmp, this.flags)) {

          this.requestUpdate();
          return;
        }
      }
      this.pattern = tmp;

      // Regex is empty so cannot have an error
      this.hasError = false;
      this._setWholeRegex()
      if (this.regexError !== '') {
        // We no longer have an error message so we'd better update
        // the UI
        this.regexError = '';
        this.requestUpdate();
      }

      // Let the outside world know there's something new to work with.
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true })
      );
    }
  }

  /**
   * Do all the work of testing the sample input against the regex
   *
   * @param event
   */
  replaceChange (event: Event) : void {
    const raw = this._getValue(event);
    const tmp = raw.substring(0, this.maxlength);

    if (tmp !== this.replace) {
      this.replace = tmp;

      // Let the outside world know there's something new to work with.
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true })
      );
    }
  }

  /**
   * Event handler function for flag field Key Up events
   * (used for adjusting the width)
   *
   * @param event
   */
  replaceKeyup (event: Event) : void {
    event.preventDefault()
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const tmp = raw.substring(0, this.maxlength);

    const size = this._getSize(tmp, false);
    let doUpdate = false;

    if (size !== this._replaceSize) {
      this._replaceSize = size;
      doUpdate = true;
    }
    if (raw !== tmp) {
      input.value = tmp;
      doUpdate = true;
    }

    if (doUpdate) {
      this.requestUpdate();
    }
  }

  /**
   * Event handler function for flag field Key Up events
   * (used for adjusting the width)
   *
   * @param event
   */
  flagKeyup (event: Event) : void {
    event.preventDefault()
    const input = event.target as HTMLInputElement;

    if (this.flagState === 'show') {
      const value = this._cleanFlags(input.value)
      const tmp = this._getSize(value, true);
      let doUpdate = false;

      if (tmp !== this._flagSize) {
        this._flagSize = tmp;
        doUpdate = true;
      }

      if (this._flagErrors.length > 0) {
        doUpdate = true;
      }

      if (input.value !== value) {
        input.value = value;
      }

      if (doUpdate === true) {
        this.requestUpdate();
      }
    } else {
      // someone has tried to do something naughty
      // revert the flags to what they should be
      input.value = this.flags;
    }
  }

  /**
   * Event handler function for regex flags change events
   *
   * (Used for letting the outside world know the regex has changed
   * and is valid)
   *
   * @param event
   */
  flagChange (event: Event) : void {
    if (this.flagState === 'show') {
      const value = this._cleanFlags(this._getValue(event))

      if (this.flags !== value) {
        // Flags have actually changed so let the outside world know
        this.flags = value;
        this._setWholeRegex()

        this.dispatchEvent(
          new Event('change', { bubbles: true, composed: true })
        )
      }
    }
  }

  /**
   * Event handler for toggling the Sample testing UI open & close
   *
   * @param event
   */
  toggleTestUI (event: Event) : void {
    event.preventDefault()

    this._showTestUI = !this._showTestUI;
  }

  /**
   * Event handler for toggling whether or not to split sample
   * on new lines
   *
   * @param event
   */
  toggleSplit (event: Event) : void {
    event.preventDefault()
    this.splitSample = this._getIsChecked(event)
  }

  /**
   * Event handler for toggling whether or not to trim sample(s)
   * before applying regex
   *
   * @param event
   */
  toggleTrim (event: Event) : void {
    event.preventDefault()
    this.trimSample = this._getIsChecked(event)
  }

  /**
   * Event handler for toggling whether or not to show white space
   * characters in replacement output.
   *
   * @param event
   */
  toggleShowWhitespace (event: Event) : void {
    event.preventDefault()
    this._showWhiteSpace = this._getIsChecked(event)
  }

  /**
   * Event handler for updating the state when user changes the
   * sample string
   *
   * @param event
   */
  sampleChange (event: Event) : void {
    this.testSample = this._getValue(event)
  }

  /**
   * Do all the work of testing the sample input against the regex
   *
   * @param event
   */
  runTest (event: Event) : void {
    event.preventDefault()

    // Only bother running the test if there is a non-empty sample
    // to work with.
    if (this.testSample.trim() !== '') {
      if (this.notJs === false) {
        this._showResults = true;

        this._getTestResults()
        this.requestUpdate()
      } else {
        // Only dispatch an event if an external engine is used
        this.dispatchEvent(
          new Event('click', { bubbles: true, composed: true })
        )
      }
    }
  }

  //  END:  Private helper methods
  // --------------------------------------------
  // START: Public methods


  /**
   * Render the results from a single sample
   *
   * @param input Single sample match data
   *
   * @returns HTML for a single sample match
   */
  renderSingleTestResult (input : TResult) : TemplateResult {
    // console.group('renderSingleTestResult()');
    // console.log('input:', input);
    // console.log('input.sample:', input.sample);
    // console.log('input.matches:', input.matches);
    // console.groupEnd();

    return html`
    <div class="match-result">
      <p><strong>Sample:</strong> <code>${input.sample}</code></p>
      <p><strong>Result:</strong> <code>${input.output}</code></p>
      ${(input.matches.length === 0)
        ? html`<p>Nothing was matched</p>`
        : html`<ol class="result-matches">${input.matches.map(match => html`<li>"<code>${match}</code>"</li>`)}</ol>`}
    </div>
    `
  }

  /**
   * Render the results from all samples
   *
   * @returns HTML for a all sample matches
   */
  renderTestResults () : TemplateResult|string {
    this._showResults = false;
    // console.group('renderTestResults()')
    // console.log('this.regexError:', this.regexError)
    // console.log('this.flags:', this.flags)
    // console.log('this.testSample:', this.testSample)

    if (this.regexError === '') {
      if (this.results.length > 0) {
        // console.log('Rendering some results');
        // console.groupEnd();

        return (this.results.length > 1)
          ? html`<ul class="multi-match">${this.results.map(item => html`<li>${this.renderSingleTestResult(item)}</li>`)}</ul>`
          : this.renderSingleTestResult(this.results[0]);
      } else {
        // console.log('There were no results');
        // console.groupEnd();
        return ''
      }
    } else {
      // console.log('Bad regex');
      // console.groupEnd();
      this.requestUpdate();
      return html`Regular expression invalid: <code>${this.regexError}</code>`;
    }
  }

  /**
   * Render the user interface for sample test
   *
   * @param regexUI   Input fields for
   * @param hasErrors Whether or not there are any errors in the regex
   * @param errors    Rendered error HTML (or empty string)
   *
   * @returns {TemplateResult}
   */
  renderTestUI (
    hasErrors : boolean,
    errors : TemplateResult|string
  ) : TemplateResult {
    // console.group('renderTestUI()')
    // console.log('this._showResults:', this._showResults)
    // console.log('this.results:', this.results)
    // console.groupEnd();
    return html`
    <button class="close-bg" @click=${this.toggleTestUI}>Close</button>
    <section class="test-ui">
      <button class="close" @click=${this.toggleTestUI}>Close</button>
      <div class="test-ui-inner">
        <div class="error-block${(hasErrors) ? ' has-errors' : ''}" aria-live="assertive" role="alert">${errors}</div>
        <div class="regex">
          <span class="wrap">${this.renderRegex()}</span>
        </div>
        <textarea @change=${this.sampleChange}>${this.testSample}</textarea>
        <div class="controls">
          <button class="test-btn" @click=${this.runTest}>Run test</button>
          <label class="split-checkbox">
            <input type="checkbox"
                   .checked=${this.splitSample}
                   @change=${this.toggleSplit} />
            Spilt sample on new line
          </label>
          <label class="trim-checkbox">
            <input type="checkbox"
                   .checked=${this.trimSample}
                   @change=${this.toggleTrim} />
            Trim sample${(this.splitSample) ? 's' : ''}
          </label>
          <label class="ws-checkbox">
            <input type="checkbox"
                   .checked=${this._showWhiteSpace}
                   @change=${this.toggleShowWhitespace} />
            Show white space characters
          </label>
        </div>
        <div class="test-results" aria-live="polite">
          ${(this._showResults)
            ? this.renderTestResults()
            : ''
          }
        </div>
      </div>
    </section>`;
  }

  /**
   * Render the flags input fields
   *
   * @param labelClass whether or not the label should be shown or
   *                   hidden
   *
   * @returns {TemplateResult|string}
   */
  renderFlags(labelClass: string) : TemplateResult|string {
    const flagsClass = (this._flagErrors.length > 0)
      ? ' has-error'
      : ''

    switch (this.flagState) {
      case 'hide':
        return '';

      case 'disabled':
        return html`<span class="flags">${this.flags}</span>`;

      default:
    }
    return html`
      <label for="${this.labelID}_flags" class="${labelClass}">
        Flags
      </label>
      <input type="text"
            id="${this.labelID}_flags"
            name="${this.labelID}_flags"
            class="regex-flags${flagsClass}"
            .value="${this.flags}"
            placeholder="${this._placeFlag}"
            minlength="7"
            @keyup=${this.flagKeyup}
            @change=${this.flagChange}
            style="width: ${this._flagSize}rem"
            ?disabled=${(this.disabled || this.flagState == 'disabled')}
            title="regular expression flags (modifiers)"
      />`;
  }

  /**
   * Render the regex & flags input fields along with the delimiters
   *
   * @returns {TemplateResult}
   */
  renderRegex() : TemplateResult {
    const regexClass = (this.regexError !== '')
      ? ' has-error'
      : ''

    const labelClass = (this.showLabels === true)
      ? ''
      : 'sr-only';

    const open = (this.flagState !== 'hide' && !this.noDelims)
      ? html`<span class="delim">${this._delimOpen}</span>`
      : ''
    const close = (this.flagState !== 'hide' && !this.noDelims)
      ? html`<span class="delim">${this._delimClose}</span>`
      : ''

    const flags = this.renderFlags(labelClass)

    return (!this.disabled)
      ? html`
        ${open}
        <label for="${this.labelID}_regex" class="${labelClass}">
          Regular expression
        </label>
        <input type="text"
              id="${this.labelID}_regex"
              name="${this.labelID}_regex"
              class="regex-pattern${regexClass}"
              .value="${this._escape(this.pattern)}"
              placeholder=".*"
              minlength="${this.maxlength}"
              @change=${this.regexChange}
              @keyup=${this.regexKeyup}
              style="width: ${this._regexSize}rem"
              ?disabled=${this.disabled}
              title="Regular expression pattern"
        />
        ${close}
        ${flags}
        <span class="bar"></span>
        <label for="${this.labelID}_replace" class="${labelClass}">
          Regular expression
        </label>
        <input type="text"
              id="${this.labelID}_replace"
              name="${this.labelID}_replace"
              class="regex-replace"
              .value="${this._escape(this.replace)}"
              placeholder="\\1\\2"
              minlength="${this.maxlength}"
              @change=${this.replaceChange}
              @keyup=${this.replaceKeyup}
              style="width: ${this._replaceSize}rem"
              ?disabled=${this.disabled}
              title="Regular expression replacement pattern"
        />`
      : html`${open}${this.pattern}${close}${flags}
        <span class="bar"></span>${this.replace}`
  }

  /**
   * Render the primary UI
   *
   * @returns {TemplateResult}
   */
  render() {
    console.group('render()')
    this._doInit();

    const allErrors = (this.regexError !== '')
      ? [this.regexError, ...this._flagErrors]
      : [...this._flagErrors]

    const hasErrors = (allErrors.length >= 1)

    const errors = (hasErrors === false)
      ? ''
      : (allErrors.length === 1)
        ? html`
          <p class="errors">
            <strong>Error:</strong>
            ${allErrors[0]}
          </p>`
        :html`
          <div class="errors">
            <strong>Errors:</strong>
            <ul>
              ${allErrors.map(error => html`<li>${error}</li>`)}
            </ul>
          </div>`;

    // console.log('this.testable:', this.testable)
    // console.log('this.testable === true:', this.testable === true)
    // console.log('hasErrors:', hasErrors)
    // console.log('hasErrors === false:', hasErrors === false)
    // console.log('this.pattern:', this.pattern)
    // console.log('this.pattern !== "":', this.pattern !== '')
    const showBtn = (hasErrors === false &&
                     this.pattern !== '');

    const testBtn = (showBtn === true)
      ? html`<button @click=${this.toggleTestUI}>Test</button>`
      : ''

    const testClass = (showBtn === true) ? ' testing' : '';

    // const UI = this.renderRegex();

    console.groupEnd();

    return html`
    <div class="whole">
      <div aria-live="assertive" role="alert">${errors}</div>
      <span class="wrap${testClass}">
        ${(!this._showTestUI) ? this.renderRegex() : ''}
        ${testBtn}
      </span>
    </div>${(this._showTestUI && !this.disabled)
      ? this.renderTestUI(hasErrors, errors)
      : ''}`;
  }
}
