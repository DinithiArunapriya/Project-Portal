Upgrade plan: Java 21

Goal
- Move the project to Java 21 (LTS) and ensure it builds/tests under Java 21.

Assumptions
- Project uses Maven (pom.xml present).
- Spring Boot 3.3.2 is compatible with Java 21 (Spring Boot 3.3.x requires Java 17+ and is compatible with Java 21).
- Developer will install a JDK 21 on their machine (or we can add instructions to install one).

Changes made
- Updated `<java.version>` property to 21 in `pom.xml`.
- Added `maven-compiler-plugin` with `<release>21</release>` to enforce compilation target.

Next steps (local)
1. Install JDK 21 and set JAVA_HOME to the JDK 21 installation.
2. Run a local build: `./mvnw -v` then `./mvnw clean package` and fix any compile/test failures.
3. Run unit tests: `./mvnw test`.
4. If there are bytecode or dependency issues, update dependencies (e.g., rebuild native libs, upgrade incompatible libraries).

Recommended quick checks
- Check for use of removed/changed APIs between Java 17 and 21 (rare for most Spring apps).
- Ensure CI (GitHub Actions or other) uses JDK 21 images.

If you want, I can:
- Add a CI workflow change to use `actions/setup-java` with Java 21.
- Attempt to run `./mvnw -DskipTests clean package` here and report errors (requires installed JDK 21 in the environment).

Status: pom.xml updated. Waiting on local JDK 21 install to run builds and finish verification.
