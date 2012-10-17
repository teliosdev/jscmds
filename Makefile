SCRIPT_FILES=src/jscmds.coffee src/header.coffee src/tools.coffee src/command_parser.coffee src/register.coffee src/manual.coffee src/base.coffee
INTERFACE_FILES=demo/js/int/interface.coffee demo/js/int/header.coffee demo/js/int/logger.coffee demo/js/int/base.coffee

all:
	coffee -o . -c -j $(SCRIPT_FILES)
	@@coffee -c -b demo/js/main.coffee
	coffee -c -j $(INTERFACE_FILES)


test:
	coffee -c $(SCRIPT_FILES)
