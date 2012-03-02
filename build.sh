set -e

OUTPUT_DIR=$PWD/build
OUTPUT_JS_FILE="metrics-dashboard.$(git rev-parse --verify HEAD).js"
OUTPUT_CSS_FILE="metrics-dashboard.$(git rev-parse --verify HEAD).css"

COMPRESSOR="java -jar $PWD/tools/yuicompressor-2.4.7.jar"

echo "[$(date +%H:%M:%S)] Preparing $OUTPUT_DIR"
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR/js $OUTPUT_DIR/css

echo "[$(date +%H:%M:%S)] Compressing JS"
find $PWD/vendor/js $PWD/js -type f -name '*.js' | xargs cat | $COMPRESSOR --type js > $OUTPUT_DIR/js/$OUTPUT_JS_FILE

echo "[$(date +%H:%M:%S)] Compressing CSS"
find $PWD/vendor/css $PWD/css -type f -name '*.css' | xargs cat | $COMPRESSOR --type css > $OUTPUT_DIR/css/$OUTPUT_CSS_FILE

echo "[$(date +%H:%M:%S)] Staging images"
cp -r $PWD/vendor/css/images $OUTPUT_DIR/css
cp -r $PWD/vendor/img $OUTPUT_DIR
