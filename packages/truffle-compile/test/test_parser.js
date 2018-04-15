var fs = require("fs");
var path = require("path");
var Parser = require("../parser");
var CompilerProvider = require("../compilerProvider")
var assert = require("assert");

describe("Parser", function() {
  var source = null;
  var erroneousSource = null;
  var solc;

  before("get code", async function() {
    source = fs.readFileSync(path.join(__dirname, "./sources/MyContract.sol"), "utf-8");
    erroneousSource = fs.readFileSync(path.join(__dirname, "./sources/ShouldError.sol"), "utf-8");

    const provider = new CompilerProvider();
    solc = await provider.load();
  });

  it("should return correct imports", function() {
    var imports = Parser.parseImports(source, solc);

    // Note that this test is important because certain parts of the solidity
    // output cuts off path prefixes like "./" and "../../../". If we get the
    // imports list incorrectly, we'll have collisions.
    var expected = [
      './Dependency.sol',
      './path/to/AnotherDep.sol',
      '../../../path/to/AnotherDep.sol',
      'ethpmpackage/Contract.sol'
    ];

    assert.deepEqual(imports, expected)
  });

  it("should throw an error when parsing imports if there's an actual parse error", function() {
    var error = null;
    try {
      Parser.parseImports(erroneousSource, solc);
    } catch(e) {
      error = e;
    }

    if (!error) {
      throw new Error("Expected a parse error but didn't get one!");
    }

    assert(error.message.indexOf("Expected pragma, import directive or contract") >= 0);
  });

  it.skip("should return a full AST when parsed, even when dependencies don't exist", function() {
    this.timeout(4000);

    var output = Parser.parse(source);

    assert.deepEqual(output.contracts, ["MyContract", "SomeInterface", "SomeLibrary"]);
    assert(output.ast.nodes.length > 0);

    // The above assert means we at least got some kind of AST.
    // Is there something we specifically need here?
  });

  it.skip("should throw an error when parsing completely if there's an actual parse error", function() {
    var error = null;
    try {
      Parser.parse(erroneousSource);
    } catch(e) {
      error = e;
    }

    if (!error) {
      throw new Error("Expected a parse error but didn't get one!");
    }

    assert(error.message.indexOf("Expected pragma, import directive or contract") >= 0);
  });
});
