package net.explorviz.collaboration.service.room;

import java.awt.Color;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A service that is used by the user service to assign different colors to each user.
 */
public class ColorAssignmentService {

  /**
   * The colors that can be assigned by this service.
   */
  private static final Color[] COLORS = {new Color(255, 0, 0), // red
      new Color(0, 167, 250), // blue
      new Color(209, 0, 209), // pink
      new Color(0, 209, 188), // turquoise
      new Color(219, 208, 0), // yellow
      new Color(189, 126, 217), // purple
      new Color(0, 175, 206), // ocean blue
      new Color(241, 141, 0), // orange
  };

  /**
   * Counts how often each of the {@link colors} has been assigned already.
   */
  private final Map<Color, Integer> counters = new LinkedHashMap<>();

  public ColorAssignmentService() {
    // Initialize all counters with zero.
    for (final Color color : COLORS) {
      this.counters.put(color, 0);
    }
  }

  /**
   * Gets the next color that has been assigned the least.
   *
   * @return The assigned color.
   */
  public Color assignColor() {
    int minCount = Integer.MAX_VALUE;
    Color minCountColor = null;
    for (final Map.Entry<Color, Integer> entry : this.counters.entrySet()) {
      final var color = entry.getKey();
      final var count = entry.getValue();
      if (count < minCount) {
        minCountColor = color;
        minCount = count;
      }
    }
    this.counters.put(minCountColor, minCount + 1);
    return minCountColor;
  }

  /**
   * Makes the given color assignable to another user.
   *
   * @param color The color to unassign.
   */
  public void unassignColor(final Color color) {
    if (this.counters.containsKey(color)) {
      final int count = this.counters.get(color);
      this.counters.put(color, count - 1);
    }
  }
}
