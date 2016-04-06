#! /usr/bin/env php
<?php
/*
Copyright 2016 - Present Calvin Grunewald. All Rights Reserved.

This file is part of Color Jump.

Color Jump is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Color Jump is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Color Jump.  If not, see <http://www.gnu.org/licenses/>.
*/

$license = <<<EOT
Copyright 2016 - Present Calvin Grunewald. All Rights Reserved.

This file is part of Color Jump.

Color Jump is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Color Jump is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Color Jump.  If not, see <http://www.gnu.org/licenses/>.
EOT;
$exploded_license = explode("\n", $license);

function insert_license($include_comment_start = false) {
  if ($include_comment_start) {
    echo "/**\n";
  }
  global $exploded_license;
  foreach ($exploded_license as $license_line) {
    echo " * " . $license_line . "\n";
  }
  if ($include_comment_start) {
    echo "*/\n\n";
  } else {
    echo " * \n";
  }
}

$comment_starter = "/**";


$inserted = false;
$found_comment = false;

while (!feof(STDIN) && ($line = fgets(STDIN)) !== null) {
  $orig_line = $line;
  if ($found_comment) {
    $found_comment = false;

    if (strpos($line, $exploded_license[0]) === false) {
      insert_license();
    }
    $inserted = true;
  }

  if (!$inserted) {
    if (strpos($line, $comment_starter) !== false) {
      $found_comment = true;
      echo $orig_line;
      continue;
    } else {
      insert_license(true);
      $inserted = true;
    }
  }

  echo $orig_line;
}
