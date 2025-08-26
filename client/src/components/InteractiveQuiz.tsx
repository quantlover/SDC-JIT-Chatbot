import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'clinical-case';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  optionFeedback?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  learningObjective: string;
}

interface GeneratedTest {
  title: string;
  phase: string;
  week: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  timeAllowed: number;
  passingScore: number;
}

interface InteractiveQuizProps {
  testData: GeneratedTest;
  onComplete?: (score: number, answers: Record<string, any>) => void;
}

export function InteractiveQuiz({ testData, onComplete }: InteractiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = testData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const showCurrentFeedback = showFeedback[currentQuestion.id];

  const handleAnswerSelect = (answer: number | string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleShowFeedback = () => {
    setShowFeedback(prev => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final score
      let correctCount = 0;
      testData.questions.forEach(question => {
        const userAnswer = selectedAnswers[question.id];
        if (userAnswer === question.correctAnswer) {
          correctCount++;
        }
      });
      
      const finalScore = Math.round((correctCount / testData.questions.length) * 100);
      setScore(finalScore);
      setQuizCompleted(true);
      onComplete?.(finalScore, selectedAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback({});
    setQuizCompleted(false);
    setScore(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-4xl mx-auto" data-testid="quiz-completed">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            <CheckCircle className="w-8 h-8 inline mr-2" />
            Quiz Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-blue-600" data-testid="final-score">
            {score}%
          </div>
          <p className="text-lg text-gray-600">
            You scored {score}% on {testData.title}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Performance Summary:</p>
            <div className="flex justify-center space-x-4 text-sm">
              <span>Correct: {Math.round((score / 100) * testData.questions.length)}</span>
              <span>Total: {testData.questions.length}</span>
              <span className={score >= testData.passingScore ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {score >= testData.passingScore ? 'PASSED' : 'NEEDS REVIEW'}
              </span>
            </div>
          </div>
          <Button onClick={resetQuiz} className="mt-4" data-testid="button-retake">
            <RefreshCw className="w-4 h-4 mr-2" />
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto" data-testid="interactive-quiz">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{testData.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {testData.questions.length}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline">{currentQuestion.topic}</Badge>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2" data-testid="question-text">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showCurrentFeedback;
                
                let buttonStyle = "text-left h-auto p-4 justify-start";
                if (showResult) {
                  if (isCorrect) {
                    buttonStyle += " bg-green-100 border-green-500 text-green-800 hover:bg-green-100";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle += " bg-red-100 border-red-500 text-red-800 hover:bg-red-100";
                  } else {
                    buttonStyle += " bg-gray-50 text-gray-600";
                  }
                } else if (isSelected) {
                  buttonStyle += " bg-blue-100 border-blue-500 text-blue-800";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonStyle}
                    onClick={() => !showCurrentFeedback && handleAnswerSelect(index)}
                    disabled={showCurrentFeedback}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                      </span>
                      {showResult && (
                        <span className="ml-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </>
          )}

          {currentQuestion.type === 'true-false' && (
            <>
              {['True', 'False'].map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showCurrentFeedback;
                
                let buttonStyle = "text-left h-auto p-4 justify-start";
                if (showResult) {
                  if (isCorrect) {
                    buttonStyle += " bg-green-100 border-green-500 text-green-800 hover:bg-green-100";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle += " bg-red-100 border-red-500 text-red-800 hover:bg-red-100";
                  } else {
                    buttonStyle += " bg-gray-50 text-gray-600";
                  }
                } else if (isSelected) {
                  buttonStyle += " bg-blue-100 border-blue-500 text-blue-800";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonStyle}
                    onClick={() => !showCurrentFeedback && handleAnswerSelect(index)}
                    disabled={showCurrentFeedback}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                      </span>
                      {showResult && (
                        <span className="ml-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </>
          )}
        </div>

        {/* Feedback Section */}
        {showCurrentFeedback && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">Answer Explanation:</h4>
            
            {currentQuestion.type === 'multiple-choice' && currentQuestion.optionFeedback && (
              <div>
                <h5 className="font-medium text-sm text-gray-700 mb-2">Option Analysis:</h5>
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => {
                    const feedback = currentQuestion.optionFeedback![index];
                    const isCorrect = index === currentQuestion.correctAnswer;
                    return (
                      <div key={index} className="text-sm">
                        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="ml-2 text-gray-700">{feedback}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-1">Overall Explanation:</h5>
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <div>
            {hasAnswered && !showCurrentFeedback && (
              <Button 
                onClick={handleShowFeedback}
                variant="secondary"
                data-testid="button-show-feedback"
              >
                Show Answer & Explanation
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            {currentQuestionIndex > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                data-testid="button-previous"
              >
                Previous
              </Button>
            )}
            
            {showCurrentFeedback && (
              <Button 
                onClick={handleNextQuestion}
                data-testid="button-next"
              >
                {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}