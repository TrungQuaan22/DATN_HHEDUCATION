export const placementAccessInclude = {
  course: {
    select: {
      teacherId: true
    }
  },
  lesson: {
    select: {
      chapter: {
        select: {
          course: {
            select: {
              teacherId: true
            }
          }
        }
      }
    }
  }
}

export const runtimeAssessmentInclude = {
  assessment: {
    include: {
      sourceMedia: true,
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            },
            include: {
              question: {
                include: {
                  options: {
                    orderBy: {
                      orderIndex: 'asc' as const
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export const runtimeAssessmentPreviewInclude = {
  assessment: {
    include: {
      sourceMedia: true,
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            }
          }
        }
      }
    }
  }
}

export const answerInclude = {
  mcqAnswers: {
    include: {
      selectedOptions: true
    }
  },
  tfAnswers: true,
  numericAnswers: true,
  essayAnswers: true,
  assessment: {
    include: {
      sourceMedia: true,
      sections: {
        orderBy: {
          orderIndex: 'asc' as const
        },
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc' as const
            },
            include: {
              question: {
                include: {
                  options: {
                    orderBy: {
                      orderIndex: 'asc' as const
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  placement: {
    include: placementAccessInclude
  },
  student: {
    select: {
      id: true,
      fullName: true,
      email: true
    }
  }
}
