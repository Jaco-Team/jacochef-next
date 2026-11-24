import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../../components/auth/recovery.js", import.meta.url), "utf8");
const {
  RECOVERY_CODE_LENGTH,
  RECOVERY_PHONE_ERROR,
  parseRecoveryPhone,
  maskedRecoveryPhone,
  passwordRecoveryRules,
  isRecoveryCodeComplete,
  isRecoveryCodeError,
  formatRecoveryCountdown,
} = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

for (const [input, display, apiValue] of [
  ["89879340391", "8 (987) 934-03-91", "89879340391"],
  ["8 (987) 934-03-91", "8 (987) 934-03-91", "89879340391"],
  ["+7 (987) 934-03-91", "+7 (987) 934-03-91", "+79879340391"],
  ["7 987 934 03 91", "+7 (987) 934-03-91", "+79879340391"],
  ["79879340391", "+7 (987) 934-03-91", "+79879340391"],
  ["9879340391", "+7 (987) 934-03-91", "+79879340391"],
  ["  +7 (987) 934-03-91  ", "+7 (987) 934-03-91", "+79879340391"],
]) {
  test(`recovery phone normalizes ${JSON.stringify(input)} without changing its prefix style`, () => {
    assert.deepEqual(parseRecoveryPhone(input), { display, apiValue, valid: true });
    assert.deepEqual(parseRecoveryPhone(display), { display, apiValue, valid: true });
  });
}

test("empty and cleared recovery phones stay empty and invalid", () => {
  for (const input of ["", " ", null, undefined]) {
    assert.deepEqual(parseRecoveryPhone(input), { display: "", apiValue: "", valid: false });
  }
});

test("incomplete phones keep their entered prefix and remain editable", () => {
  for (const [input, display, apiValue] of [
    ["8", "8", "8"],
    ["7", "+7", "+7"],
    ["+7", "+7", "+7"],
    ["9", "+7 (9", "+79"],
    ["8987", "8 (987", "8987"],
    ["+7 (987) 934-03-9", "+7 (987) 934-03-9", "+7987934039"],
  ]) {
    assert.deepEqual(parseRecoveryPhone(input), { display, apiValue, valid: false });
  }
});

test("deleting national digits does not switch a recovery phone prefix", () => {
  for (const [number, prefix] of [["89879340391", "8"], ["+79879340391", "+7"]]) {
    let display = parseRecoveryPhone(number).display;
    for (let length = 9; length >= 0; length -= 1) {
      display = parseRecoveryPhone(display.slice(0, -1)).display;
      assert.ok(display.startsWith(prefix));
      assert.equal(parseRecoveryPhone(display).valid, false);
      assert.equal(display.replace(/\D/g, "").length, length + 1);
    }
    assert.equal(display, prefix);
  }
});

test("the plus-seven prefix can be deleted completely without the mask inserting it again", () => {
  const remainingPrefix = parseRecoveryPhone("+7".slice(0, -1));
  assert.deepEqual(remainingPrefix, { display: "+", apiValue: "+", valid: false });
  assert.deepEqual(parseRecoveryPhone(remainingPrefix.display.slice(0, -1)), { display: "", apiValue: "", valid: false });
});

test("phone validation requires exactly ten national digits starting with nine", () => {
  for (const input of [
    "8987934039",
    "898793403910",
    "+7987934039",
    "+798793403910",
    "987934039",
    "98793403910",
    "84879340391",
    "+74879340391",
    "01234567890",
    "1234567890",
  ]) {
    assert.equal(parseRecoveryPhone(input).valid, false, `${input} must not enable sending`);
  }
  assert.equal(RECOVERY_PHONE_ERROR, "Введите номер в формате +7 или 8");
});

test("overlong pasted phones do not become valid when their displayed mask is parsed again", () => {
  for (const input of ["898793403910", "+7 (987) 934-03-910", "98793403910"]) {
    const parsed = parseRecoveryPhone(input);
    assert.equal(parsed.valid, false);
    assert.equal(parseRecoveryPhone(parsed.display).valid, false, `${input} must not silently lose extra digits`);
  }
});

test("unsupported plus-eight prefixes are not silently converted to valid plus-seven phones", () => {
  for (const input of ["+89879340391", "+8 (987) 934-03-91"]) {
    const parsed = parseRecoveryPhone(input);
    assert.equal(parsed.valid, false, `${input} is not an accepted prefix`);
    assert.equal(parseRecoveryPhone(parsed.display).valid, false);
  }
});

test("masked confirmation numbers preserve the entered prefix and reveal only the area and last two digits", () => {
  for (const input of ["89879340391", "8 (987) 934-03-91"]) {
    assert.equal(maskedRecoveryPhone(input), "8 (987) ***-**-91");
  }
  for (const input of ["+79879340391", "+7 (987) 934-03-91", "79879340391", "9879340391"]) {
    assert.equal(maskedRecoveryPhone(input), "+7 (987) ***-**-91");
  }
});

test("recovery retains the six-digit API and provider contract including leading zeroes", () => {
  assert.equal(RECOVERY_CODE_LENGTH, 6);
  assert.equal(isRecoveryCodeComplete("123456"), true);
  assert.equal(isRecoveryCodeComplete("012345"), true);
  for (const code of ["", "1234", "12345", "1234567", "12a456", "123 456", " 123456", "123456 "]) {
    assert.equal(isRecoveryCodeComplete(code), false, `${JSON.stringify(code)} must be rejected`);
  }
});

test("password rules match the existing API requirement for length, ASCII upper/lowercase and a digit", () => {
  assert.deepEqual(passwordRecoveryRules("Test1234", "Test1234"), { length: true, characters: true, match: true });
  assert.deepEqual(passwordRecoveryRules("Test123", "Test123"), { length: false, characters: true, match: true });
  for (const password of ["TEST1234", "test1234", "Password", "Пароль12"]) {
    assert.equal(passwordRecoveryRules(password, password).characters, false, password);
  }
});

test("matching passwords must be nonempty and exact rather than trimmed or case-folded", () => {
  assert.equal(passwordRecoveryRules("", "").match, false);
  assert.equal(passwordRecoveryRules("Test1234", "Test1234 ").match, false);
  assert.equal(passwordRecoveryRules("Test1234", "test1234").match, false);
  assert.equal(passwordRecoveryRules("Test1234", "").match, false);
});

test("only the known invalid or expired code response is rendered as an OTP error", () => {
  assert.equal(isRecoveryCodeError("Код подтверждения неверен или истёк"), true);
  for (const message of ["Слишком много попыток", "Ошибка соединения", "Пароль должен содержать цифры", "", null]) {
    assert.equal(isRecoveryCodeError(message), false);
  }
});

test("resend countdown uses minute-second formatting and never displays negative seconds", () => {
  for (const [seconds, expected] of [[60, "1:00"], [59, "0:59"], [9, "0:09"], [1, "0:01"], [0, "0:00"], [-1, "0:00"], [90, "1:30"], [59.1, "1:00"], ["60", "1:00"]]) {
    assert.equal(formatRecoveryCountdown(seconds), expected);
  }
});
