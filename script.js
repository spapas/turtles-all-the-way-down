
const colorPalette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',  // 0-3: black, white, red, green
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',  // 4-7: blue, yellow, magenta, cyan
  '#ffa500', '#800080', '#ffc0cb', '#a52a2a',  // 8-11: orange, purple, pink, brown
  '#808080', '#c0c0c0', '#800000', '#008000',  // 12-15: gray, silver, maroon, dark green
  '#000080', '#808000', '#ff6347', '#4682b4'   // 16-19: navy, olive, tomato, steel blue
];

const colorNames = {
  'μαύρο': 0, 'άσπρο': 1, 'κόκκινο': 2, 'πράσινο': 3,
  'μπλε': 4, 'κίτρινο': 5, 'μαζέντα': 6, 'κυανό': 7,
  'πορτοκαλί': 8, 'μοβ': 9, 'ροζ': 10, 'καφέ': 11,
  'γκρι': 12, 'ασημί': 13, 'μπορντώ': 14, 'σκούροπράσινο': 15,
  'ναυτικό': 16, 'ελιά': 17, 'ντομάτα': 18, 'ατσάλι': 19,
  'black': 0, 'white': 1, 'red': 2, 'green': 3,
  'blue': 4, 'yellow': 5, 'magenta': 6, 'cyan': 7,
  'orange': 8, 'purple': 9, 'pink': 10, 'brown': 11,
  'gray': 12, 'silver': 13, 'maroon': 14, 'darkgreen': 15,
  'navy': 16, 'olive': 17, 'tomato': 18, 'steelblue': 19
};

class TurtleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.turtleElement = document.getElementById('turtle');
    this.reset();

    // Animation settings
    this.animationSpeed = 50; // ms between steps

    this.isAnimating = false;
    this.currentStep = 0;
    this.steps = [];
    this.animationId = null;
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.angle = 0; // 0 = up, 90 = right, 180 = down, 270 = left
    this.penIsDown = true;
    this.penColor = '#000000';
    this.penWidth = 2;
    this.updateTurtlePosition();
  }

  updateTurtlePosition() {
    // Get actual turtle element size
    const turtleRect = this.turtleElement.getBoundingClientRect();
    const width = turtleRect.width || 20;
    const height = turtleRect.height || 20;

    // Place center of emoji at (x, y) and rotate around center
    this.turtleElement.style.left = this.x + 'px';
    this.turtleElement.style.top = this.y + 'px';
  this.turtleElement.style.transform = `translate(-50%, -50%) rotate(${this.angle + 90}deg) translateY(-30%)`;
  }

  forward(distance) {
    const radians = (this.angle - 90) * Math.PI / 180;
    const newX = this.x + distance * Math.cos(radians);
    const newY = this.y + distance * Math.sin(radians);

    if (this.penIsDown) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(newX, newY);
      this.ctx.strokeStyle = this.penColor;
      this.ctx.lineWidth = this.penWidth;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }

    this.x = newX;
    this.y = newY;
    this.updateTurtlePosition();
  }

  back(distance) {
    this.forward(-distance);
  }

  left(degrees) {
    this.angle -= degrees;
    this.updateTurtlePosition();
  }

  right(degrees) {
    this.angle += degrees;
    this.updateTurtlePosition();
  }

  penUp() {
    this.penIsDown = false;
  }

  penDown() {
    this.penIsDown = true;
  }

  home() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.angle = 0;
    this.updateTurtlePosition();
  }

  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.home();
  }

  setColor(color) {
    // Handle numeric color indices
    if (typeof color === 'number' || !isNaN(parseInt(color))) {
      const index = parseInt(color);
      if (index >= 0 && index < colorPalette.length) {
        this.penColor = colorPalette[index];
        this.updateColorSelection(index);
        return;
      }
    }

    // Handle color names (Greek and English)
    const colorIndex = colorNames[color.toLowerCase()];
    if (colorIndex !== undefined) {
      this.penColor = colorPalette[colorIndex];
      this.updateColorSelection(colorIndex);
      return;
    }

    // Handle hex colors directly
    if (color.startsWith('#')) {
      this.penColor = color;
      this.updateColorSelection(-1); // No selection for custom colors
      return;
    }

    // Fallback: try to use as direct color
    this.penColor = color;
    this.updateColorSelection(-1);
  }

  updateColorSelection(index) {
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach((swatch, i) => {
      swatch.classList.toggle('selected', i === index);
    });
  }

  setWidth(width) {
    this.penWidth = Math.max(1, Math.min(20, width));
  }
}

// Command localization
const commandAliases = {
  gr: {
    'μπροστά': 'forward', 'μπ': 'forward', 
    'πίσω': 'back', 'πι': 'back',
    'αριστερά': 'left', 'αρ': 'left', 
    'δεξιά': 'right', 'δε': 'right',
    'σήκωσεμολύβι': 'penup', 'σμ': 'penup', 
    'κατέβασεμολύβι': 'pendown', 'κμ': 'pendown',
    'επανάλαβε': 'repeat', 'επ': 'repeat',
    'σπίτι': 'home', 'σπ': 'home',
    'καθάρισε': 'clearscreen', 'κα': 'clearscreen',
    'χρ': 'setcolor', 'πλ': 'setwidth',
    'βάλεχρώμα': 'setcolor', 'βάλεπλάτος': 'setwidth',
    // English fallbacks
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'τυχαίο': 'random', 'τυ': 'random', 'random': 'random'
  },
  en: {
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'random': 'random'
  },
  es: {
    'adelante': 'forward', 'ad': 'forward', 'atras': 'back', 'at': 'back',
    'izquierda': 'left', 'iz': 'left', 'derecha': 'right', 'de': 'right',
    'subirlapiz': 'penup', 'sl': 'penup', 'bajarlapiz': 'pendown', 'bl': 'pendown',
    'repetir': 'repeat', 'casa': 'home', 'limpiar': 'clearscreen', 'li': 'clearscreen',
    'poncolor': 'setcolor', 'ponancho': 'setwidth',
    // English fallbacks
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'aleatorio': 'random', 'al': 'random', 'random': 'random'
  },
  fr: {
    'avance': 'forward', 'av': 'forward', 'recule': 'back', 're': 'back',
    'gauche': 'left', 'ga': 'left', 'droite': 'right', 'dr': 'right',
    'levecrayon': 'penup', 'lc': 'penup', 'baissecrayon': 'pendown', 'bc': 'pendown',
    'repete': 'repeat', 'origine': 'home', 'efface': 'clearscreen', 'ef': 'clearscreen',
    'fixecouleur': 'setcolor', 'fixelargeur': 'setwidth',
    // English fallbacks
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'hasard': 'random', 'rand': 'random', 'random': 'random'
  },
  de: {
    'vorwaerts': 'forward', 'vw': 'forward', 'rueckwaerts': 'back', 'rw': 'back',
    'links': 'left', 'li': 'left', 'rechts': 'right', 'rt': 'right',
    'stifthoch': 'penup', 'sh': 'penup', 'stiftrunter': 'pendown', 'sr': 'pendown',
    'wiederhole': 'repeat', 'startpos': 'home', 'loesche': 'clearscreen', 'ls': 'clearscreen',
    'setzefarbe': 'setcolor', 'setzebreite': 'setwidth',
    // English fallbacks
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'zufall': 'random', 'zuf': 'random', 'random': 'random'
  },
  it: {
    'avanti': 'forward', 'av': 'forward', 'indietro': 'back', 'in': 'back',
    'sinistra': 'left', 'si': 'left', 'destra': 'right', 'de': 'right',
    'alzapenna': 'penup', 'ap': 'penup', 'abbassapenna': 'pendown', 'ab': 'pendown',
    'ripeti': 'repeat', 'casa': 'home', 'pulisci': 'clearscreen', 'pu': 'clearscreen',
    'impostacolore': 'setcolor', 'impostalarghezza': 'setwidth',
    // English fallbacks
    'forward': 'forward', 'fd': 'forward', 'back': 'back', 'bk': 'back',
    'left': 'left', 'lt': 'left', 'right': 'right', 'rt': 'right',
    'penup': 'penup', 'pu': 'penup', 'pendown': 'pendown', 'pd': 'pendown',
    'repeat': 'repeat', 'home': 'home', 'clearscreen': 'clearscreen', 'cs': 'clearscreen',
    'setcolor': 'setcolor', 'setwidth': 'setwidth',
    'casuale': 'random', 'cas': 'random', 'random': 'random'
  }
};

// Help text translations
const helpTexts = {
  gr: `<strong>Κίνηση:</strong> μπροστά/μπ, πίσω/πι, αριστερά/αρ, δεξιά/δε<br>
                 <strong>Μολύβι:</strong> σήκωσεμολύβι/σμ, κατέβασεμολύβι/κμ<br>
                 <strong>Έλεγχος:</strong> επανάλαβε/επ, σπίτι/σπ, καθάρισε/κα, τυχαίο/τυ<br>
                 <strong>Στυλ:</strong> βάλεχρώμα/χρ, βάλεπλάτος/πλ<br>
                 <strong>Παράδειγμα:</strong> μπροστά 50, δεξιά 90, επανάλαβε 4 [μπροστά 50 δεξιά 90]`,
  en: `<strong>Movement:</strong> forward/fd, back/bk, left/lt, right/rt<br>
                 <strong>Pen:</strong> penup/pu, pendown/pd<br>
                 <strong>Control:</strong> repeat, home, clearscreen/cs<br>
                 <strong>Style:</strong> setcolor, setwidth<br>
                 <strong>Example:</strong> forward 50, right 90, repeat 4 [forward 50 right 90]`,
  es: `<strong>Movimiento:</strong> adelante/ad, atras/at, izquierda/iz, derecha/de<br>
                 <strong>Lápiz:</strong> subirlapiz/sl, bajarlapiz/bl<br>
                 <strong>Control:</strong> repetir, casa, limpiar/li<br>
                 <strong>Estilo:</strong> poncolor, ponancho<br>
                 <strong>Ejemplo:</strong> adelante 50, derecha 90, repetir 4 [adelante 50 derecha 90]`,
  fr: `<strong>Mouvement:</strong> avance/av, recule/re, gauche/ga, droite/dr<br>
                 <strong>Crayon:</strong> levecrayon/lc, baissecrayon/bc<br>
                 <strong>Contrôle:</strong> repete, origine, efface/ef<br>
                 <strong>Style:</strong> fixecouleur, fixelargeur<br>
                 <strong>Exemple:</strong> avance 50, droite 90, repete 4 [avance 50 droite 90]`,
  de: `<strong>Bewegung:</strong> vorwaerts/vw, rueckwaerts/rw, links/li, rechts/rt<br>
                 <strong>Stift:</strong> stifthoch/sh, stiftrunter/sr<br>
                 <strong>Kontrolle:</strong> wiederhole, startpos, loesche/ls<br>
                 <strong>Stil:</strong> setzefarbe, setzebreite<br>
                 <strong>Beispiel:</strong> vorwaerts 50, rechts 90, wiederhole 4 [vorwaerts 50 rechts 90]`,
  it: `<strong>Movimento:</strong> avanti/av, indietro/in, sinistra/si, destra/de<br>
                 <strong>Penna:</strong> alzapenna/ap, abbassapenna/ab<br>
                 <strong>Controllo:</strong> ripeti, casa, pulisci/pu<br>
                 <strong>Stile:</strong> impostacolore, impostalarghezza<br>
                 <strong>Esempio:</strong> avanti 50, destra 90, ripeti 4 [avanti 50 destra 90]`
};

// Logo parser and interpreter
class LogoParser {
  constructor(turtle, language = 'gr') {
    this.turtle = turtle;
    this.language = language;
    this.aliases = commandAliases[language];
  }

  setLanguage(language) {
    this.language = language;
    this.aliases = commandAliases[language];
  }

  // Evaluate arithmetic expressions with variables and random
  evalExpression(expr, context = {}) {
    // Replace :var with value from context
    expr = expr.replace(/:([a-zA-Z0-9_]+)/g, (m, v) => {
      if (context[v] !== undefined) return context[v];
      throw new Error(`Unknown variable: :${v}`);
    });
    // Replace 'random N' with a random integer
    expr = expr.replace(/random\s+([0-9]+)/gi, (m, n) => Math.floor(Math.random() * Number(n)));
    // Only allow numbers, operators, parentheses, and spaces
    if (!/^[-+*/(). 0-9]+$/.test(expr)) {
      throw new Error('Invalid characters in expression: ' + expr);
    }
    // Evaluate safely
    try {
      // eslint-disable-next-line no-eval
      return Function('return (' + expr + ')')();
    } catch (e) {
      throw new Error('Invalid expression: ' + expr);
    }
  }

  parse(code) {
    // Remove comments
    const lines = code.split('\n').map(line =>
      line.split('#')[0].trim()
    ).filter(line => line.length > 0);

    const tokens = [];
    for (const line of lines) {
      tokens.push(...this.tokenize(line));
    }

  return this.parseTokens(tokens, {});
  }

  tokenize(line) {
    const tokens = [];
    let current = '';
    let inBrackets = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '[') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        inBrackets = true;
        tokens.push('[');
      } else if (char === ']') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        inBrackets = false;
        tokens.push(']');
      } else if (char === ' ' || char === '\t') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  parseTokens(tokens) {
    return this.parseTokens(tokens, context = {});
  }

  parseTokens(tokens, context = {}) {
    const commands = [];
    let i = 0;

    while (i < tokens.length) {
      const result = this.parseCommand(tokens, i, context);
      if (result.command) {
        commands.push(result.command);
      }
      i = result.nextIndex;
    }

    return commands;
  }

  // Evaluate a value token (number, nested command, variable, or expression)
  evalValue(token, context = {}) {
    // Arithmetic expression (contains + - * / or parentheses) - check first!
    if (typeof token === 'string' && /[+\-*/()]/.test(token)) {
      return this.evalExpression(token, context);
    }
    // Variable (e.g. :val)
    if (typeof token === 'string' && token.startsWith(':')) {
      const varName = token.slice(1);
      if (context[varName] !== undefined) return context[varName];
      throw new Error(`Unknown variable: ${token}`);
    }
    // Number (accept string numbers too)
    if (typeof token === 'number') return token;
    if (typeof token === 'string' && !isNaN(token) && token.trim() !== '') return parseFloat(token);
    if (!isNaN(parseFloat(token)) && isFinite(token)) return parseFloat(token);
    // Nested command node (e.g. random)
    if (typeof token === 'object' && token.type) {
      switch (token.type) {
        case 'random':
          const n = this.evalValue(token.value, context);
          if (typeof n !== 'number' || isNaN(n) || n <= 0) throw new Error('random requires a positive number');
          return Math.floor(Math.random() * n);
        default:
          throw new Error(`Cannot evaluate expression of type: ${token.type}`);
      }
    }
    // Fallback: string
    // Try to parse as number if possible
    if (!isNaN(token) && token.trim() !== '') return parseFloat(token);
    return token;
  }

  // Parse arithmetic expression that may span multiple tokens
  parseExpression(tokens, startIndex) {
    let expression = '';
    let i = startIndex;
    
    // Look ahead to collect tokens that form an arithmetic expression
    while (i < tokens.length) {
      const token = tokens[i];
      
      // Stop if we hit a bracket or a known command
      if (token === '[' || token === ']') break;
      if (this.aliases[token?.toLowerCase?.()] && 
          !this.isExpressionToken(token)) break;
      
      // Add token to expression with proper spacing
      if (expression) {
        expression += ' ';
      }
      expression += token;
      i++;
      
      // If this token completes a simple expression (no operators after it), we can stop
      if (!this.isOperator(token) && 
          (i >= tokens.length || !this.isOperator(tokens[i]))) {
        // Check if next token is an operator, if not, we're done
        if (i >= tokens.length || 
            tokens[i] === '[' || tokens[i] === ']' ||
            this.aliases[tokens[i]?.toLowerCase?.()] && !this.isExpressionToken(tokens[i])) {
          break;
        }
      }
    }
    
    return {
      expression: expression.trim(),
      nextIndex: i
    };
  }
  
  // Check if token is an operator
  isOperator(token) {
    return /^[+\-*/()]$/.test(token);
  }
  
  // Check if token can be part of an expression
  isExpressionToken(token) {
    return /^[+\-*/():0-9.]+$/.test(token) || token.startsWith(':');
  }

  parseCommand(tokens, startIndex, context = {}) {
    if (startIndex >= tokens.length) {
      return { command: null, nextIndex: startIndex + 1 };
    }

    const token = tokens[startIndex].toLowerCase();
    const command = this.aliases[token];

    if (!command) {
      throw new Error(`Unknown command: ${tokens[startIndex]}`);
    }

    // Special: random as expression
    if (command === 'random') {
      if (startIndex + 1 >= tokens.length) throw new Error('random requires a number');
      // Parse argument as value (could be number, variable, or nested command)
      let valueToken = tokens[startIndex + 1];
      // Support nested random (e.g. random random 5)
      if (this.aliases[valueToken?.toLowerCase?.()] === 'random') {
        const nested = this.parseCommand(tokens, startIndex + 1, context);
        valueToken = nested.command;
        return {
          command: { type: 'random', value: valueToken },
          nextIndex: nested.nextIndex
        };
      }
      return {
        command: { type: 'random', value: valueToken },
        nextIndex: startIndex + 2
      };
    }

    switch (command) {
      case 'forward':
      case 'back':
      case 'left':
      case 'right':
      case 'setwidth': {
        if (startIndex + 1 >= tokens.length) {
          throw new Error(`${command} requires a number`);
        }
        // Parse arithmetic expression that may span multiple tokens
        const exprResult = this.parseExpression(tokens, startIndex + 1);
        return {
          command: { type: command, value: exprResult.expression },
          nextIndex: exprResult.nextIndex
        };
      }

      case 'setcolor': {
        if (startIndex + 1 >= tokens.length) {
          throw new Error(`setcolor requires a color`);
        }
        // First check if it's a nested random command
        let valueToken = tokens[startIndex + 1];
        if (this.aliases[valueToken?.toLowerCase?.()] === 'random') {
          const nested = this.parseCommand(tokens, startIndex + 1, context);
          valueToken = nested.command;
          return {
            command: { type: 'setcolor', value: valueToken },
            nextIndex: nested.nextIndex
          };
        }
        // Otherwise parse as expression (for color names or indices)
        const exprResult = this.parseExpression(tokens, startIndex + 1);
        return {
          command: { type: 'setcolor', value: exprResult.expression },
          nextIndex: exprResult.nextIndex
        };
      }

      case 'penup':
      case 'pendown':
      case 'home':
      case 'clearscreen':
        return {
          command: { type: command },
          nextIndex: startIndex + 1
        };


      case 'repeat': {
        if (startIndex + 1 >= tokens.length) {
          throw new Error(`repeat requires a number`);
        }
        // Parse the repeat count expression
        const exprResult = this.parseExpression(tokens, startIndex + 1);
        const count = this.evalValue(exprResult.expression, context);
        if (typeof count !== 'number' || isNaN(count)) {
          throw new Error(`repeat requires a valid number`);
        }
        if (exprResult.nextIndex >= tokens.length || tokens[exprResult.nextIndex] !== '[') {
          throw new Error(`repeat requires commands in brackets [ ]`);
        }
        const blockResult = this.parseBlock(tokens, exprResult.nextIndex + 1, context);
        return {
          command: { type: 'repeat', count: count, commands: blockResult.commands },
          nextIndex: blockResult.nextIndex
        };
      }

      default:
        throw new Error(`Unhandled command: ${command}`);
    }
  }

  parseBlock(tokens, startIndex, context = {}) {
    const commands = [];
    let i = startIndex;
    let bracketLevel = 1;

    while (i < tokens.length && bracketLevel > 0) {
      if (tokens[i] === '[') {
        bracketLevel++;
      } else if (tokens[i] === ']') {
        bracketLevel--;
        if (bracketLevel === 0) {
          break;
        }
      }

      if (bracketLevel === 1) {
        const result = this.parseCommand(tokens, i, context);
        if (result.command) {
          commands.push(result.command);
        }
        i = result.nextIndex;
      } else {
        i++;
      }
    }

    if (bracketLevel > 0) {
      throw new Error(`Missing closing bracket ]`);
    }

    return { commands: commands, nextIndex: i + 1 };
  }

  execute(commands, context = {}) {
    const steps = [];
    this.generateSteps(commands, steps, context);
    return steps;
  }

  generateSteps(commands, steps, context = {}) {
    for (const command of commands) {
      switch (command.type) {
        case 'forward':
          steps.push(() => this.turtle.forward(this.evalValue(command.value, context)));
          break;
        case 'back':
          steps.push(() => this.turtle.back(this.evalValue(command.value, context)));
          break;
        case 'left':
          steps.push(() => this.turtle.left(this.evalValue(command.value, context)));
          break;
        case 'right':
          steps.push(() => this.turtle.right(this.evalValue(command.value, context)));
          break;
        case 'penup':
          steps.push(() => this.turtle.penUp());
          break;
        case 'pendown':
          steps.push(() => this.turtle.penDown());
          break;
        case 'home':
          steps.push(() => this.turtle.home());
          break;
        case 'clearscreen':
          steps.push(() => this.turtle.clearScreen());
          break;
        case 'setcolor':
          steps.push(() => this.turtle.setColor(this.evalValue(command.value, context)));
          break;
        case 'setwidth':
          steps.push(() => this.turtle.setWidth(this.evalValue(command.value, context)));
          break;
        case 'repeat':
          for (let i = 0; i < command.count; i++) {
            // Pass loop variable :val and :rep in context
            const newContext = { ...context, val: i, rep: i };
            this.generateSteps(command.commands, steps, newContext);
          }
          break;
        case 'random':
          // Should not be called directly as a step, only as value
          break;
      }
    }
  }
}

function initializeColorPalette() {
  const paletteContainer = document.getElementById('colorPalette');

  colorPalette.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('data-color', color);
    swatch.textContent = index;
    swatch.title = `Color ${index}: ${color}`;

    // Add click handler
    swatch.addEventListener('click', () => {
      turtle.setColor(index);
      updateStatus(`Χρώμα άλλαξε σε ${index} (${color})`);
    });

    // Select black (index 0) by default
    if (index === 0) {
      swatch.classList.add('selected');
    }

    paletteContainer.appendChild(swatch);
  });
}

// Global variables
let turtle;
let parser;
let isRunning = false;
let currentStepIndex = 0;
let executionSteps = [];

// Initialize
window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas');
  const container = canvas.parentElement;

  // Make canvas responsive
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width - 2;
    canvas.height = rect.height - 2;
    if (turtle) {
      turtle.reset();
    }
  }

  initializeColorPalette();

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  turtle = new TurtleEngine(canvas);
  parser = new LogoParser(turtle, 'el');

  updateStatus('Ready to run Logo commands');

  // Language change handler
  document.getElementById('language').addEventListener('change', (e) => {
    const lang = e.target.value;
    parser.setLanguage(lang);
    document.getElementById('help-text').innerHTML = helpTexts[lang];
    updateStatus(`Language changed to ${lang}`);
  });
  parser.setLanguage('gr');
  document.getElementById('help-text').innerHTML = helpTexts['gr'];
});

// Control functions
function runCode() {
  if (isRunning) {
    updateStatus('Already running! Stop first.');
    return;
  }

  const code = document.getElementById('code').value;
  hideError();

  try {
    const commands = parser.parse(code);
    executionSteps = parser.execute(commands);
    currentStepIndex = 0;
    isRunning = true;

    updateStatus(`Running ${executionSteps.length} steps...`);
    executeNextStep();
  } catch (error) {
    window.lastError = error;
    showError(error);
    updateStatus('Error in code');
  }
}

function executeNextStep() {
  if (!isRunning || currentStepIndex >= executionSteps.length) {
    isRunning = false;
    updateStatus('Execution complete');
    return;
  }

  try {
    executionSteps[currentStepIndex]();
    currentStepIndex++;

    updateStatus(`Step ${currentStepIndex}/${executionSteps.length}`);

    setTimeout(executeNextStep, turtle.animationSpeed);
  } catch (error) {
    isRunning = false;
    window.lastError = error;
    showError(error);
    updateStatus('Runtime error');
  }
}

function stepCode() {
  if (!executionSteps.length) {
    const code = document.getElementById('code').value;
    hideError();

    try {
      const commands = parser.parse(code);
      executionSteps = parser.execute(commands);
      currentStepIndex = 0;
      updateStatus(`Ready to step through ${executionSteps.length} commands`);
    } catch (error) {
      window.lastError = error;
      showError(error);
      updateStatus('Error in code');
      return;
    }
  }

  if (currentStepIndex < executionSteps.length) {
    try {
      executionSteps[currentStepIndex]();
      currentStepIndex++;
      updateStatus(`Step ${currentStepIndex}/${executionSteps.length}`);

      if (currentStepIndex >= executionSteps.length) {
        updateStatus('Stepping complete');
        executionSteps = [];
      }
    } catch (error) {
      window.lastError = error;
      showError(error);
      updateStatus('Runtime error');
    }
  } else {
    updateStatus('No more steps');
  }
}

function stopExecution() {
  isRunning = false;
  executionSteps = [];
  currentStepIndex = 0;
  updateStatus('Execution stopped');
}

function clearCanvas() {
  turtle.clearScreen();
  stopExecution();
  updateStatus('Canvas cleared');
}

function updateSpeed() {
  const speed = document.getElementById('speed').value;
  turtle.animationSpeed = (1000 - (speed * 10)) / 10; // Invert: higher value = faster
  console.log(`Animation speed set to: ${turtle.animationSpeed} ms`);
}

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function showError(message) {
  const errorElement = document.getElementById('error');
  if (typeof message === 'object' && message !== null && message.message) {
    errorElement.textContent = message.message;
  } else {
    errorElement.textContent = message;
  }
  errorElement.style.display = 'block';
  // Print stacktrace if available
  if (typeof message === 'object' && message.stack) {
    console.error('Error stacktrace:', message.stack);
  } else if (window.lastError && window.lastError.stack) {
    console.error('Error stacktrace:', window.lastError.stack);
  }
}

function hideError() {
  document.getElementById('error').style.display = 'none';
}