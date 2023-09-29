import React from 'react'
import Reveal from 'reveal';

class Slideshow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {chapters: []}
  }

  componentDidMount() {
    this.fetchChapters();
    this.handleSlideChanged();
  }

  componentDidUpdate(prevProps, prevState) {
    const {socket, mode, toolbar} = this.props;
    if (mode !== prevProps.mode) {
      if (mode === 'presenter') {
        Reveal.addEventListener('slidechanged', (event) => socket.emit('slidechanged', Reveal.getIndices()));
      } else {
        Reveal.removeEventListener('slidechanged');
      }
      this.handlePresenterQuiz();
    }
    if (toolbar.follow !== prevProps.toolbar.follow) {
      if (toolbar.follow) {
        socket.on('slidechanged', (current_slide) => Reveal.slide(current_slide.h, current_slide.v));
      } else {
        socket.off('slidechanged');
      }
    }
  }

  fetchChapters() {
    fetch(window.location.protocol + '//' + window.location.host + '/chapters')
      .then(response => response.json())
      .then(chapters => {
        // Escape tags inside <code>
        chapters = chapters.map(chapter => chapter.replace(/<code class="([a-z-]*)">((\s|\S)*?)<\/code>/g, (match, grp1, grp2) => '<code class="' + grp1 + '">' + grp2.replace(/<([a-zA-Z?])/g, "&lt;$1") + '</code>'));
        this.setState({chapters: chapters}, () => {
          Reveal.initialize({
            history: true,
            slideNumber: true,
            ...this.props.config.revealjs // Load params from config file
          });
          document.getElementById('revealexpress').dispatchEvent(new CustomEvent('loaded', {
            detail: {
              config: {
                name: this.props.config.name,
                port: this.props.config.port,
                portws: this.props.config.portws
              },
              Reveal: Reveal
            }
          }));
          this.handleQuiz();
        })
      })
  }

  handleSlideChanged() {
    const {socket, mode} = this.props;

    if (mode === 'presenter') {
      Reveal.addEventListener('slidechanged', (event) => socket.emit('slidechanged', Reveal.getIndices()));
    }
  }

  handleQuiz() {
    const {socket} = this.props;

    const forms = document.querySelectorAll('form.quiz-form');
    let submittedForm = [];

    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (submittedForm.indexOf(event.target) === -1) {
          const values = new FormData(event.target);
          let data = [];
          for (const value of values.entries()) {
            data.push(value);
          }
          socket.emit('quizsubmitted', data);
          form.querySelectorAll('input').forEach((input) => {
            input.disabled = true;
          });
          submittedForm.push(event.target);
        }
      });
    });
  }

  handlePresenterQuiz() {
    const {socket, mode} = this.props;

    if (mode === 'presenter') {
      document.querySelectorAll('.quiz-options input').forEach((input) => {
        const counter = document.createElement('div');
        counter.classList.add('counter');
        counter.innerText = '0';
        input.nextElementSibling.appendChild(counter);
      });

      socket.on('quizsubmitted', (values) => {
        for (const value of values) {
          const [name, answer] = value;
          const counter = document.querySelector('input[name="' + name + '"][value="' + answer + '"]').parentNode.querySelector('div.counter');
          counter.innerText = parseInt(counter.innerText) + 1;
        }
      });
    } else {
      socket.off('quizsubmitted');
      document.querySelectorAll('.quiz-options input').forEach((input) => {
        input.nextElementSibling.querySelector('div.counter').remove();
      });
    }
  }

  render() {
    return (
      <div className='reveal'>
        <div className='slides' dangerouslySetInnerHTML={{__html: this.state.chapters.join('')}}></div>
      </div>
    )
  }
}

export default Slideshow
