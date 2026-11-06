/**
 * Raise the Gradle heap for release builds.
 *
 * `android/` is gitignored in this project, so every EAS build runs `expo prebuild` and
 * regenerates `gradle.properties` from the template — which is why editing that file by
 * hand had no effect on the build. This patches it during prebuild instead, so the setting
 * travels with the project.
 */
const { withGradleProperties } = require("@expo/config-plugins");

const JVM_ARGS = "-Xmx6144m -XX:MaxMetaspaceSize=1024m";

const MANAGED = {
	"org.gradle.jvmargs": JVM_ARGS,
	// D8 merges the whole app's dex inside the daemon, so fewer concurrent workers lowers
	// peak memory at the same ceiling.
	"org.gradle.workers.max": "2",
	"org.gradle.parallel": "false",
};

module.exports = function withGradleJvmArgs(config) {
	return withGradleProperties(config, (result) => {
		result.modResults = result.modResults.filter(
			(entry) => entry.type !== "property" || !(entry.key in MANAGED),
		);
		for (const [key, value] of Object.entries(MANAGED)) {
			result.modResults.push({ type: "property", key, value });
		}
		return result;
	});
};
