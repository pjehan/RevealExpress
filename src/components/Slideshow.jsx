import React from 'react'
import Reveal from 'reveal';
import Prism from 'prismjs'
import prismLoadLanguages from 'prismjs/components/index'
import PrismLineNumber from 'prismjs/plugins/line-numbers/prism-line-numbers.min'
import PrismLineHightlight from 'prismjs/plugins/line-highlight/prism-line-highlight.min'

class Slideshow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {chapters: []}
    }

    componentDidMount() {
        this.handleSlideChanged();
        this.handleQuiz();
        this.fetchChapters();
    }

    fetchChapters() {
        fetch(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/chapters')
          .then((response) => {
              return response.json()
          })
          .then((chapters) => {
              // Escape tags inside <code>
              chapters = chapters.map(chapter => chapter.replace(/<code class="([a-z-]*)">((\s|\S)*?)<\/code>/g, (match, grp1, grp2) => '<code class="' + grp1 + '">' + grp2.replace(/<([a-zA-Z?])/g, "&lt;$1") + '</code>'));
              this.setState({chapters: chapters}, () => {
                  Reveal.initialize({
                      history: true,
                      slideNumber: true
                  });
                  prismLoadLanguages(['php', 'sql', 'jsx', 'bash']); // TODO: Load from config file
                  Prism.highlightAll()
              })
          })
    }

    handleSlideChanged() {
        this.props.app.socket.on('slidechanged', (current_slide) => {
            if (this.props.toolbar.follow) {
                Reveal.slide(current_slide.h, current_slide.v);
            }
        });

        if (this.props.app.mode === 'presenter') {
            Reveal.addEventListener('slidechanged', (event) => this.props.app.socket.emit('slidechanged', Reveal.getIndices()));
        }
    }

    handleQuiz() {
        var forms = document.querySelectorAll('form.quiz-form');
        var submittedForm = [];

        forms.forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();

                if (submittedForm.indexOf(event.target) == -1) {
                    var values = new FormData(event.target);
                    var data = [];
                    for (var value of values.entries()) {
                        data.push(value);
                    }
                    this.props.app.socket.emit('quizsubmitted', data);
                    form.querySelectorAll('input').forEach((input) => {
                        input.disabled = true;
                    });
                    submittedForm.push(event.target);
                }
            });
        });

        if (this.props.app.mode === 'presenter') {
            document.querySelectorAll('.quiz-options input').forEach((input) => {
                var counter = document.createElement('div');
                counter.classList.add('counter');
                counter.innerText = '0';
                input.nextElementSibling.appendChild(counter);
            });

            this.props.app.socket.on('quizsubmitted', (data) => {
                for (var i = 0; i < data.length; i++) {
                    var counter = document.querySelector('section.quiz.present input[name="' + data[i][0] + '"][value="' + data[i][1] + '"]').parentNode.querySelector('div.counter');
                    counter.innerText = parseInt(counter.innerText) + 1;
                }
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
