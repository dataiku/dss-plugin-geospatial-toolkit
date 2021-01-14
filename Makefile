PLUGIN_VERSION=0.1.0
PLUGIN_ID=geospatial-toolkit

plugin:
	./gradlew dist
	cat plugin.json|json_pp > /dev/null
	rm -rf dist
	mkdir dist
	zip -r dist/dss-plugin-${PLUGIN_ID}-${PLUGIN_VERSION}.zip plugin.json lib js

unit-tests:
	./gradlew test

dist-clean:
	rm -rf dist