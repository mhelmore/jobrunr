package org.jobrunr.utils.exceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ExceptionsTest {

    @Test
    void hasCauseReturnsTrueIfExceptionHasGivenCause() {
        final boolean hasInterruptedExceptionAsCause = Exceptions.hasCause(new RuntimeException(new InterruptedException()), InterruptedException.class);
        assertThat(hasInterruptedExceptionAsCause).isTrue();
    }

    @Test
    void hasCauseReturnsFalseIfExceptionDoesNotHaveGivenCause() {
        final boolean hasInterruptedExceptionAsCause = Exceptions.hasCause(new RuntimeException(new IllegalStateException()), InterruptedException.class);
        assertThat(hasInterruptedExceptionAsCause).isFalse();
    }

}