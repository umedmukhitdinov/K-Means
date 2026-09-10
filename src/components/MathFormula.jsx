import { Children } from 'react';

const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

function Norm({ children, dimension = null, squared = false }) {
  const norm = (
    <mrow>
      <mo>‖</mo>
      {children}
      <mo>‖</mo>
    </mrow>
  );

  return (
    dimension && squared
      ? <msubsup>{norm}<mn>{dimension}</mn><mn>2</mn></msubsup>
      : dimension
        ? <msub>{norm}<mn>{dimension}</mn></msub>
        : squared
          ? <msup>{norm}<mn>2</mn></msup>
          : norm
  );
}

function MathLine({ number, children }) {
  return (
    <div className="math-formula-line">
      {number && <span className="math-formula-number">{number})</span>}
      <math xmlns={MATHML_NAMESPACE} display="block">
        {children}
      </math>
    </div>
  );
}

function Formula({ label, children, numbered = false }) {
  return (
    <div className="math-formula" aria-label={label}>
      {numbered
        ? Children.toArray(children).map((line, index) => (
          <MathLine key={index} number={index + 1}>{line}</MathLine>
        ))
        : <MathLine>{children}</MathLine>}
    </div>
  );
}

export function InitializationFormula() {
  return (
    <Formula label="Вероятность выбора точки пропорциональна квадрату расстояния" numbered>
      <mrow>
        <mi>P</mi><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mtext> выбран</mtext><mo>)</mo>
        <mo>∝</mo><msup><mi>D</mi><mn>2</mn></msup><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>)</mo>
      </mrow>
      <mrow>
        <mi>D</mi><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>)</mo><mo>=</mo>
        <munder><mo>min</mo><mi>c</mi></munder><Norm dimension="2"><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><mi>c</mi></Norm>
      </mrow>
    </Formula>
  );
}

export function AssignmentFormula() {
  return (
    <Formula label="Назначение точки ближайшему центроиду">
      <mrow>
        <msub><mi>c</mi><mi>i</mi></msub><mo>=</mo>
        <munder><mo>arg min</mo><mi>k</mi></munder>
        <Norm dimension="2" squared><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><msub><mi>μ</mi><mi>k</mi></msub></Norm>
      </mrow>
      <mo>,</mo><mtext> </mtext><mi>k</mi><mo>∈</mo><mo>{'{1, …, K}'}</mo>
    </Formula>
  );
}

export function UpdateFormula() {
  return (
    <Formula label="Обновление центроида как среднего точек кластера">
      <mrow>
        <msub><mi>μ</mi><mi>k</mi></msub><mo>=</mo>
        <mfrac><mn>1</mn><msub><mi>|S|</mi><mi>k</mi></msub></mfrac>
        <munder><mo>∑</mo><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>∈</mo><msub><mi>S</mi><mi>k</mi></msub></mrow></munder>
        <msub><mi>x</mi><mi>i</mi></msub>
      </mrow>
    </Formula>
  );
}

export function ObjectiveFormula() {
  return (
    <Formula label="Целевая функция суммы квадратов расстояний" numbered>
      <mrow>
        <mi>J</mi><mo>=</mo>
        <munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></munderover>
        <munder><mo>∑</mo><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>∈</mo><msub><mi>S</mi><mi>k</mi></msub></mrow></munder>
        <Norm dimension="2" squared><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><msub><mi>μ</mi><mi>k</mi></msub></Norm>
      </mrow>
      <mrow><mi>J</mi><mo>→</mo><mtext> локальный min</mtext></mrow>
    </Formula>
  );
}

export function EuclideanFormula() {
  return (
    <Formula label="Евклидово расстояние">
      <mrow>
        <mi>d</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>μ</mi><mo>)</mo><mo>=</mo>
        <msqrt><munderover><mo>∑</mo><mi>i</mi><mi>d</mi></munderover><msup><mrow><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><msub><mi>μ</mi><mi>i</mi></msub><mo>)</mo></mrow><mn>2</mn></msup></msqrt>
      </mrow>
    </Formula>
  );
}

export function ConvergenceFormula() {
  return (
    <Formula label="Условие сходимости">
      <mrow>
        <Norm dimension="2"><msub><mi>μ</mi><mi>k</mi></msub><mo>(</mo><mtext>new</mtext><mo>)</mo><mo>−</mo><msub><mi>μ</mi><mi>k</mi></msub><mo>(</mo><mtext>old</mtext><mo>)</mo></Norm>
        <mo>&lt;</mo><mi>ε</mi><mo>,</mo><mtext> </mtext><mo>∀</mo><mi>k</mi>
      </mrow>
    </Formula>
  );
}

