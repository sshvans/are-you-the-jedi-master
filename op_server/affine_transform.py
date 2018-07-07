# For details, see this article and contained github gists
# https://becominghuman.ai/single-pose-comparison-a-fun-application-using-human-pose-estimation-part-2-4fd16a8bf0d3
# https://gist.githubusercontent.com/gilbeckers/37d784bdadce7f7086dc8affc151c5fa/raw/a9a88ddf95428cc0559947a4275f78b57ea6b7a8/affine_transformation.py

import numpy as np
from op_server import ddr_score

def affine_transform(pose_points1, pose_points2):
  model_features = ddr_score.feature_vector(pose_points1)
  input_features = ddr_score.feature_vector(pose_points2)

  # In order to solve the augmented matrix (incl translation),
  # it's required all vectors are augmented with a "1" at the end
  # -> Pad the features with ones, so that our transformation can do translations too
  pad = lambda x: np.hstack([x, np.ones((x.shape[0], 1))])
  unpad = lambda x: x[:, :-1]

  # Pad to [[ x y 1] , [x y 1]]
  Y = pad(model_features)
  X = pad(input_features)

  # Solve the least squares problem X * A = Y
  # and find the affine transformation matrix A.
  A, res, rank, s = np.linalg.lstsq(X, Y, rcond=None)
  A[np.abs(A) < 1e-10] = 0  # set really small values to zero

  transform = lambda x: unpad(np.dot(pad(x), A))
  input_transform = transform(input_features)
  return input_transform