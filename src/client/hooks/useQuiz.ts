import { useEffect } from 'react';
import type { RevealApi } from 'reveal.js';
import type { QuizAnswers, UserMode } from '../../shared/types';
import type { AppSocket } from './useSocket';

/**
 * Quiz written in slides as <form class="quiz-form"> with inputs in a .quiz-options element:
 * answers are sent when the form is submitted. The presenter cannot answer: the results (a counter
 * for each option) are hidden by default and can be shown or hidden with a button.
 */
export function useQuiz(deck: RevealApi | null, socket: AppSocket, mode: UserMode) {
  useEffect(() => {
    const slides = deck?.getSlidesElement();
    if (!slides) {
      return;
    }

    const forms = slides.querySelectorAll<HTMLFormElement>('form.quiz-form');
    const submittedForms = new WeakSet<HTMLFormElement>();

    const submitAnswers = (event: SubmitEvent) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      if (submittedForms.has(form)) {
        return;
      }

      const answers: QuizAnswers = [...new FormData(form)].map(([name, value]) => [
        name,
        String(value),
      ]);
      socket.emit('quizsubmitted', answers);
      form.querySelectorAll('input').forEach((input) => (input.disabled = true));
      submittedForms.add(form);
    };

    forms.forEach((form) => form.addEventListener('submit', submitAnswers));
    return () => forms.forEach((form) => form.removeEventListener('submit', submitAnswers));
  }, [deck, socket]);

  useEffect(() => {
    const slides = deck?.getSlidesElement();
    if (!slides || mode !== 'presenter') {
      return;
    }

    // The presenter does not answer: the form is replaced by a button showing or hiding the results
    const restoreForms: (() => void)[] = [];
    for (const form of slides.querySelectorAll<HTMLFormElement>('form.quiz-form')) {
      const inputs = [...form.querySelectorAll('input')];
      const disabledInputs = inputs.filter((input) => input.disabled);
      inputs.forEach((input) => (input.disabled = true));

      const submitButtons = [
        ...form.querySelectorAll<HTMLElement>(
          'button[type="submit"], input[type="submit"], button:not([type])',
        ),
      ];
      const wasHidden = submitButtons.map((button) => button.hidden);
      submitButtons.forEach((button) => (button.hidden = true));

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.classList.add('quiz-results-toggle');
      const updateToggle = () => {
        toggle.textContent = form.classList.contains('show-results')
          ? 'Hide results'
          : 'Show results';
      };
      toggle.addEventListener('click', () => {
        form.classList.toggle('show-results');
        updateToggle();
      });
      updateToggle();
      form.appendChild(toggle);

      restoreForms.push(() => {
        toggle.remove();
        form.classList.remove('show-results'); // Results are hidden by default
        submitButtons.forEach((button, index) => (button.hidden = wasHidden[index]));
        inputs.forEach((input) => (input.disabled = disabledInputs.includes(input)));
      });
    }

    const inputs = [...slides.querySelectorAll<HTMLInputElement>('.quiz-options input')];
    const counters = new Map<HTMLInputElement, HTMLElement>();
    for (const input of inputs) {
      const counter = document.createElement('div');
      counter.classList.add('counter');
      counter.textContent = '0';
      input.nextElementSibling?.appendChild(counter);
      counters.set(input, counter);
    }

    // Answers are counted even while the results are hidden
    const countAnswers = (answers: QuizAnswers) => {
      for (const [name, value] of answers) {
        const input = inputs.find((element) => element.name === name && element.value === value);
        const counter = input && counters.get(input);
        if (counter) {
          counter.textContent = String(Number(counter.textContent) + 1);
        }
      }
    };

    socket.on('quizsubmitted', countAnswers);
    return () => {
      socket.off('quizsubmitted', countAnswers);
      counters.forEach((counter) => counter.remove());
      restoreForms.forEach((restore) => restore());
    };
  }, [deck, socket, mode]);
}
