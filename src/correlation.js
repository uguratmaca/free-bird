function average(values) {
  return values.reduce((a, b) => a + b) / values.length;
}

function rank(fVector, sVector) {
  if (fVector.length === 0 || fVector.length !== sVector.length) {
    return 0;
  }

  const fAvg = average(fVector);
  const sAvg = average(sVector);
  const fDiff = fVector.map((v) => v - fAvg);
  const sDiff = sVector.map((v) => v - sAvg);

  const numerator = fDiff.reduce((sum, v, i) => sum + v * sDiff[i], 0);
  const denominator = Math.sqrt(
    fDiff.reduce((sum, v) => sum + v * v, 0) * sDiff.reduce((sum, v) => sum + v * v, 0)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

function determination(fVector, sVector) {
  return Math.pow(rank(fVector, sVector), 2);
}

module.exports = { rank, determination };
